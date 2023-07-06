export class Constants {
    //tiempo para que se envie el audio al servidor (ms)
    public static timeAutoSend = 4500;
    //tiempo que el usuario tiene que estar callado para que se envie el audio al servidor (ms)
    public static timeInactiveSend = 650;
    //valor por defecto del beam
    public static beam = 13;
    //idioma por defecto
    public static language = 9;
    //guardar el audio por defecto (0->no  1->si)
    public static save = 0;
    //cuantas entradas del historial se cargan automaticamente
    public static limiteHistorial= 1000;
    //determina si por defecto se ocultan las entradas sin resultado de la tabla del historial
    public static filtrarSinResult=true;
    // Minimo: 42000 (requisito de la biblioteca de software)
    public static sampleRate=45000;
    public static channels=1;
  }
