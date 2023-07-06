import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
declare var $: any;
import * as RecordRTC from 'recordrtc';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../api-rest/api/auth.service';
import { LoginDTO } from '../../api-rest/model/loginDTO';
import { UsersService } from '../../api-rest/api/users.service';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { UpdateAudioDTO } from '../../api-rest/model/updateAudioDTO';
import { Observable, Subscription, timer } from 'rxjs';
import { Router, RouterModule, Routes } from '@angular/router';
import * as Constantes from '../../constantes';
import { TranslateService } from '@ngx-translate/core';
declare var require: any

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css',
  ]
})
export class MainComponent {
  //Selector de idiomas
  langSelect: FormGroup

  username: string = '';

  //Grabacion del audio
  stream1: MediaStream | undefined;
  stream2: MediaStream | undefined;
  tiempo: number = Constantes.Constants.timeAutoSend;
  record: RecordRTC.StereoAudioRecorder | undefined;
  record2: RecordRTC.StereoAudioRecorder | undefined;
  recording = false;
  vad = require('../../VAD/VAD.js');
  vadRef: any

  //Timer
  timer: Observable<number> | undefined;
  timerSubscr: Subscription | undefined;
  ciclos: number = Math.floor(Constantes.Constants.timeInactiveSend / 50);
  empezado = false;
  contTiempo = 0;
  enviar: boolean = false

  //html
  apagarBoton = false
  formPrincipal: FormGroup
  resultado: string = ''

  //indicador intendsiad de audio
  intensidad: number = 0;
  intensidad2: number = 0;
  intensidad3: number = 0;
  intensidad4: number = 0;

  //Indicador de subida
  claseBarra = 'barraOculta'

  constructor(
    public _auth: AuthService,
    public _audio: UsersService,
    private _fb: FormBuilder,
    private router: Router,
    public translate: TranslateService) {

    //Obtener el token de localStorage y guardarlo en el servicio
    if (this._auth.configuration.accessToken === undefined || this._auth.configuration.accessToken === null || this._auth.configuration.accessToken === '') {
      var a = localStorage.getItem('tokenAudioServer')
      if (a === null)
        this.router.navigate(['/login']);
      else {
        this._auth.configuration.accessToken = a
        var b = localStorage.getItem('userAudioServer')
        if (b != undefined)
          this._auth.configuration.username = b
          var c = localStorage.getItem('fechatoken')
        const fecha = new Date();
        const fechastring = fecha.getUTCDay()+'-'+fecha.getUTCMonth()+'-'+fecha.getUTCFullYear()
        if (fechastring != c)
          this.cerrarSesion()
      }
    }
    //guardar el token en el servicio de audio
    if (this._auth.configuration.accessToken)
      this._audio.configuration.accessToken = this._auth.configuration.accessToken.toString();
    //guardar el usuario
    if (this._auth.configuration.username != undefined)
      this.username = this._auth.configuration.username;

    this.langSelect = this._fb.group({
      lang: [{ value: this.translate.currentLang, disabled: false }],
    });


    //Crear el form
    this.formPrincipal = this._fb.group({
      idioma: [{ value: Constantes.Constants.language, disabled: false }],
      beam: [{ value: Constantes.Constants.beam, disabled: false }],
      guardar: [{ value: Constantes.Constants.save, disabled: false }],
      mensaje: [{ value: '', disabled: false }],
    });
  }

  ngOnInit() {
  }

  // Comenzar a grabar
  initiateRecording() {

    this.recording = true;
    let mediaConstraints = {
      video: false,
      audio: true
    };

    //Grabar audio para enviarlo al server
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback.bind(this), this.errorCallback.bind(this));
    //Para indicador de intensidad del micro
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(this.successCallback2.bind(this), this.errorCallback2.bind(this));
  }

  successCallback(stream: MediaStream) {
    //Para enviarlo al server
    this.stream1 = stream;
    var options: any = {
      type: 'audio/wav',
      mimeType: 'audio/wav',
      numberOfAudioChannels: Constantes.Constants.channels,
      sampleRate: Constantes.Constants.sampleRate,
      timeSlice: Constantes.Constants.timeAutoSend, //tiempo que tarda en generar cada blob
      ondataavailable: function (blob: any) {
        aux();
      },
    };

    //Iniciar la grabación
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record = new StereoAudioRecorder(stream, options);
    this.record.record();

    // Para la grabación, lo envia al servidor e inicia una nueva
    const aux = () => {
      this.stopRecording();
      this.initiateRecording();
    }

  }

  successCallback2(stream2: MediaStream) {
    //Para el VAD y el indicador del micro
    this.stream2 = stream2
    var options: any = {
      type: 'audio/wav',
      mimeType: 'audio/wav',
      numberOfAudioChannels: Constantes.Constants.channels,
      sampleRate: Constantes.Constants.sampleRate,
      timeSlice: 50, //el micro se actualiza cada 50ms
      ondataavailable: function () {
        comprobar()
      }
    };

    //Para iniciar la grabación
    var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
    this.record2 = new StereoAudioRecorder(stream2, options);

    //Para el medidor de volumen
    var audioContext: any;
    window.AudioContext = window.AudioContext
    audioContext = new AudioContext();
    var inicio = true;

    //Configuración del medidor de volumen
    var options2 = {
      smoothingTimeConstant: 0.1,
      noiseCaptureDuration: 200,
      minNoiseLevel: 0.2,

      onVoiceStart: function () {
        //Se para el contador de enviar el audio tras un tiempo de inactividad
        pararContador();
      },

      onVoiceStop: function () {
        //Comenzar a contar desde que el usuario se calla
        if (!inicio) {
          reiniciarContador();
        }
        inicio = false
      },

      onUpdate: function (val: any) {
        //actualzia el indicador del micro
        actualizarIndicador(val);
      }
    };

    //comenzar a grabar y a comprobar el volumen
    this.vadRef = this.vad(audioContext, stream2, options2);
    this.record2.record();

    //Cuenta la cantidad de ciclos de 50s que han pasado para saber si se ha acabdo el tiempo de inactividad
    const contar = () => {
      if (this.recording && this.empezado) {
        this.contTiempo += 1;
        if (this.contTiempo >= this.ciclos) {
          this.empezado = false
          this.contTiempo = 0;
          if (this.timerSubscr)
            this.timerSubscr.unsubscribe()
          this.timerSubscr = undefined
          this.timer = undefined
          //marca con un flag que se debe enviar el audio
          this.enviar = true
        }
      }
    }

    //reinicia el contador de ciclos
    const reiniciarContador = () => {
      if (this.timerSubscr)
        this.timerSubscr.unsubscribe()
      this.timerSubscr = undefined
      this.timer = undefined
      this.timer = timer(0, 50);
      if (this.timer != undefined)
        this.timerSubscr = this.timer.subscribe(val => {
          contar();
        })
      if (this.recording) {
        this.contTiempo = 0;
      }

      this.empezado = true
    }

    const pararContador = () => {
      if (this.timerSubscr)
        this.timerSubscr.unsubscribe()
      this.timerSubscr = undefined
      this.timer = undefined
      if (this.recording) {
        this.contTiempo = 0;
      }
      this.empezado = false
    }

    //Actualiza visualmente el indicador del micro
    const actualizarIndicador = (val: any) => {
      if (this.recording) {
        var aux = val * 100;
        if (aux < 25) {
          this.intensidad = aux
          this.intensidad2 = 0
          this.intensidad3 = 0
          this.intensidad4 = 0
        } else if (aux < 50) {
          this.intensidad = 25
          this.intensidad2 = aux - 25
          this.intensidad3 = 0
          this.intensidad4 = 0
        } else if (aux < 75) {
          this.intensidad = 25
          this.intensidad2 = 25
          this.intensidad3 = aux - 50
          this.intensidad4 = 0
        } else {
          this.intensidad = 25
          this.intensidad2 = 25
          this.intensidad3 = 25
          this.intensidad4 = aux - 75
        }
      }
    }

    //Comprueba la flag para enviar el audio
    const comprobar = () => {
      if (this.enviar) {
        this.enviar = false
        this.stopRecording();
        this.initiateRecording();
      }
    }

  }


  stopRecording() {
    this.recording = false;
    this.contTiempo = 0;
    //Para las 2 grabaciones y el VAD, y procesa el resultado
    if (this.record !== undefined) {
      this.record.stop(this.processRecording.bind(this));
    }
    if (this.record2 !== undefined)
      this.record2.stop(this.processRecording2.bind(this));

    if (this.stream1) {
      this.stream1.getAudioTracks().forEach(track => track.stop());
      this.stream1 = undefined;
    }
    if (this.stream2) {
      this.stream2.getAudioTracks().forEach(track => track.stop());
      this.stream2 = undefined;
    }
    this.vadRef.destroy()
  }

  stopRecordingAux() {
    this.stopRecording()
  }

  processRecording(blob: Blob) {
    //guardamos el blob como un archivo .wav
    const myFile = new File([blob], 'blob2.wav', {
      type: blob.type,
    });
    //Se envia al servidor
    this.enviarAudio(myFile);
  }

  processRecording2(blob: Blob) {
    //Se pone el indicador de volumen a 0
    this.intensidad = 0;
    this.intensidad2 = 0
    this.intensidad3 = 0
    this.intensidad4 = 0
  }

  limpiar() {
    //Se vuelve a los valores por defecto
    this.contTiempo = 0;
    this.resultado = '';
    this.apagarBoton = false;
  }

  enviarAudio(blob: Blob) {

    //indicador de que se está enviando el audio
    if (this.claseBarra != 'barra70')
      this.claseBarra = 'barra30'

    //Subir el audio al servidor
    this._audio.audioPostFileForm(blob, this.username).subscribe(
      (result: any) => {
        //Parametros para obtener la transcripción
        let params: UpdateAudioDTO = {
          code: this.formPrincipal.controls['idioma'].value,
          text: this.formPrincipal.controls['mensaje'].value,
          keep: this.formPrincipal.controls['guardar'].value,
          beam: this.formPrincipal.controls['beam'].value,
        }

        //ajustar los valores para evitar errores del servidor
        if (this.formPrincipal.controls['guardar'].value == '0' || this.formPrincipal.controls['guardar'].value == 'false' || this.formPrincipal.controls['guardar'].value == false)
          params.keep = false
        if (this.formPrincipal.controls['mensaje'].value == '')
          params.text = '---'

        //actualizar el indicador de subida
        this.claseBarra = 'barra70'

        //Obtener al transcripción
        this._audio.updateAudioPostFile(params, this.username, result.data.filename).subscribe(
          (res: any) => {
            this.claseBarra = 'barra100'
            //Mostrar el resultado por pantalla
            if (res.data.nbest !== null) {
              this.resultado += ' ' + res.data.nbest
              //Parar la grabación y bloquear el botón en cado de que se superen los 500 caracteres
              if (this.resultado.length >= 500) {
                if (this.recording === true){
                  console.log('a')
                  this.stopRecording();
                }
                
                this.apagarBoton = true
              }
            }
            //Se espera a que termine la animación y se reinicia el indicador de subida
            setTimeout(() => {
              if (this.claseBarra === 'barra100') {
                this.claseBarra = 'barraOculta'
              }
            }, 300);
          }
        )
      }
    )
  }

  errorCallback(error: any) {
    console.log(error)
  }
  errorCallback2(error: any) {
    console.log(error)
  }

  cerrarSesion() {
    //borrar el token y el usuario
    localStorage.removeItem('tokenAudioServer');
    localStorage.removeItem('userAudioServer');
    this.username = '';
    this._auth.configuration.username = undefined;
    this._auth.configuration.accessToken = undefined;
    this.router.navigate(['/login']);
  }

  historial() {
    this.router.navigate(['/history']);
  }

  useLanguage(event: Event): void {
    const language = (event.target as HTMLInputElement).value;
    this.translate.use(language);

  }

}
