import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService, UsersService } from 'src/app/api-rest';
import * as Constantes from '../../constantes';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class HistoryComponent {

  formFiltro: FormGroup;

  soloResultados = Constantes.Constants.filtrarSinResult

  langSelect: FormGroup

  username: string = '';

  //oculta el botónd e cargar más
  ocultar = true;

  //Carga de páginas
  llamadas = 1;
  cantidadCargada = 0
  cantidadPosible = 0;
  haySiguiente = true;
  paginasObtenidas = 0;
  limite = Constantes.Constants.limiteHistorial
  ultimaPagina = 1;

  //Tabla
  sinDatos = true;
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  displayedColumns: string[];
  displayedSubColumns: string[];
  columns: string[];
  columnsName: string[];
  subColumns: string[];
  subColumnsName: string[];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  //Deshabilita el boton de cargar más
  cargando = false;

  //Paginación
  set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.dataSource.paginator = this.paginator;
  }

  //Datos del historial
  datos: any = [];
  datosAux: any = [];


  constructor(
    public _router: Router,
    public _auth: AuthService,
    public _audio: UsersService,
    private _fb: FormBuilder,
    private router: Router,
    public translate: TranslateService
  ) {

    //Comprobar que existen y guardar el token y el nombre de usuario
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
        const fechastring = fecha.getUTCDay() + '-' + fecha.getUTCMonth() + '-' + fecha.getUTCFullYear()
        if (fechastring != c)
          this.cerrarSesion()
      }
    }
    if (this._auth.configuration.accessToken)
      this._audio.configuration.accessToken = this._auth.configuration.accessToken.toString();
    if (this._auth.configuration.username != undefined)
      this.username = this._auth.configuration.username;


    this.langSelect = this._fb.group({
      lang: [{ value: this.translate.currentLang, disabled: false }],
    });

    //Crear el form del filtro
    this.formFiltro = this._fb.group({
      fecha: [{ value: '', disabled: false }],
      opcional: [{ value: '', disabled: false }],
      nombre: [{ value: '', disabled: false }],
      resultado: [{ value: '', disabled: false }],
      fechaEdicion: [{ value: '', disabled: false }],
      soloResultados: [{ value: '', disabled: false }],
    });

    this.formFiltro.controls['soloResultados'].setValue(this.soloResultados)

    //Cargar los priemros 100 resultados
    this._audio.audioGetFile(this.username, 100, this.ultimaPagina).subscribe(
      (result: any) => {

        //Mostrar aquellos que tienen de recording tag '---' como si tuvieran una cadena vacía
        for (let index = 0; index < result.data.result.length; index++) {
          if (result.data.result[index].text === '---') {
            result.data.result[index].text = '';
          }
          this.datos.push(result.data.result[index])
        }
        
        //Actualizar contadores y flags
        this.haySiguiente = result.data.has_next_page
        this.cantidadPosible = result.data.total_results
        this.paginasObtenidas += 1;
        this.ultimaPagina += 1
        this.cantidadCargada = this.datos.length

        //Mostrarlo en la tabla
        this.dataSource = new MatTableDataSource<any>(Object.values(this.datos));
        this.dataSource.paginator = this.paginator;
        if (this.datos.length > 0) {
          this.sinDatos = false;
        } else {
          this.sinDatos = true;
        }
        //Si hay mas páginas en el servidor se cargan más
        if (this.haySiguiente === true) {
          this.obtenerMas();
        } else {
          this.filtrar();
        }
      }
    )

    //Tabla
    this.displayedColumns = ['mostrarSubtabla', 'code', 'text', 'nbest', 'keep', 'beam', 'filename', 'created_at', 'updated_at'];
    this.columns = ['mostrarSubtabla', 'code', 'text', 'nbest', 'keep', 'beam', 'filename', 'created_at', 'updated_at'];
    this.columnsName = ['code', 'text', 'nbest', 'keep', 'beam', 'filename', 'created_at', 'updated_at'];
    this.displayedSubColumns = ['channel', 'tbeg', 'dur', 'word', 'score']
    this.subColumns = ['channel', 'tbeg', 'dur', 'word', 'score']
    this.subColumnsName = ['channel', 'tbeg', 'dur', 'word', 'score']
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  //Muestra los detalles de una de las entradas de la tabla
  desplegarSubtabla(row: any) {
    row.isExpanded = true;
  }

  //Oculta los detalles de una de las entradas de la tabla
  plegarSubtabla(row: any) {
    row.isExpanded = false;
  }

  //Carga más entradas de la tabla (limiteHistorial en el fichero de constantes del fichero de constantes)
  obtenerMas() {
    this.cargando = true

    //pide la siguienmte página de 100 al servidor
    this._audio.audioGetFile(this.username, 100, this.ultimaPagina).subscribe(
      (result: any) => {

        //Mostrar aquellos que tienen de recording tag '---' como si tuvieran una cadena vacía
        for (let index = 0; index < result.data.result.length; index++) {
          if (result.data.result[index].text === '---') {
            result.data.result[index].text = '';
          }
          this.datos.push(result.data.result[index])
        }

        //actualizar contadores y flags
        this.haySiguiente = result.data.has_next_page
        this.paginasObtenidas += 1;
        this.ultimaPagina += 1

        //Si ya no quedan páginas en el servidor, o se ha llegado al límite
        if ((this.paginasObtenidas >= this.limite * this.llamadas / 100) || this.haySiguiente === false) {
          //Mostrar los datos en la tabla
          this.dataSource = new MatTableDataSource<any>(Object.values(this.datos));
          this.dataSource.paginator = this.paginator;
          this.cantidadCargada = this.datos.length;
          this.cargando = false

          //Si ya se han cargado todas las páginas ocultar la opción de cargar más
          if (this.cantidadCargada === this.cantidadPosible) {
            this.ocultar = true
          } else {
            this.ocultar = false
          }

          this.llamadas += 1;
          if (this.datos.length > 0) {
            this.sinDatos = false;
          } else {
            this.sinDatos = true;
          }
          //Aplicar el filtro
          this.filtrar();

        } else {
          //Se siguen cargando páginas hasta que se llegue al límite
          this.obtenerMas();
        }
      }
    )
  }

  //Borra el token y el usuario y vuelve al login
  cerrarSesion() {
    localStorage.removeItem('tokenAudioServer');
    localStorage.removeItem('userAudioServer');
    this.username = '';
    this._auth.configuration.username = undefined;
    this._auth.configuration.accessToken = undefined;
    this.router.navigate(['/login']);
  }

  inicio() {
    this.router.navigate(['/']);
  }

  filtrar() {
    this.datosAux = [];

    //Obtener los parámetros del filtro
    var soloResults = this.formFiltro.controls['soloResultados'].value
    var fCrea = this.formFiltro.controls['fecha'].value.toUpperCase();
    if (fCrea === null)
      fCrea = ''
    var opcional = this.formFiltro.controls['opcional'].value.toUpperCase();
    if (opcional === null)
      opcional = ''
    var nombre = this.formFiltro.controls['nombre'].value.toUpperCase()
    if (nombre === null)
      nombre = ''
    var resultado = this.formFiltro.controls['resultado'].value.toUpperCase();
    if (resultado === null)
      resultado = ''

    this.datos.forEach((element: { created_at: string, text: string, nbest: string, filename: string }) => {

      //mostramos aquellas propiedades que son nulas como cadenas vacías en la tabla
      if (element.created_at === null)
        element.created_at = ''
      if (element.text === null)
        element.text = ''
      if (element.nbest === null)
        element.nbest = ''
      if (element.filename === null)
        element.filename = ''
      
      //Si el elemento pasa el filtro se añade a los datos que se mostrarán en la tabla
      if (element.created_at.toUpperCase().includes(fCrea) && element.text.toUpperCase().includes(opcional) && element.nbest.toUpperCase().includes(resultado) && element.filename.toUpperCase().includes(nombre))
        if (soloResults) {
          if (element.nbest != '' && element.nbest != null && element.nbest != undefined)
            this.datosAux.push(element);
        } else
          this.datosAux.push(element);
    });

    //Mostrar datos en la tabla
    this.dataSource = new MatTableDataSource<any>(Object.values(this.datosAux));
    this.dataSource.paginator = this.paginator;
  }

  //Descarga los datos que se están visualizando como un archivo .json
  descargarJSON() {
    var sJson = JSON.stringify(this.datosAux);
    var element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
    element.setAttribute('download', `history.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  useLanguage(event: Event): void {
    const language = (event.target as HTMLInputElement).value;
    this.translate.use(language);

  }
}
