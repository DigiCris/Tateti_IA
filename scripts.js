var player= "X";
var jugada = { "X": [0, 0, 0, 0, 0, 0, 0, 0, 0], "O": [0, 0, 0, 0, 0, 0, 0, 0, 0] };
var stop=false;
var maquina=false;
var inteligente=false;
var cantidadDeJugadas=0;

function jugar(numero){
    //alert("jugar");
    if(stop){
        return;
    }

    var valor = document.getElementsByClassName("item")[numero].innerHTML;
    if(valor!="X" && valor!="O"){
        cantidadDeJugadas++;
        document.getElementsByClassName("item")[numero].innerHTML=player;
        jugada[player][numero]=1;
        var win=isWinner(jugada[player]);
        if(win){
            valor = document.getElementsByClassName("item")[win[1]].innerHTML;
            valor = valor + '<div class="'+win[0]+'"></div>';
            document.getElementsByClassName("item")[win[1]].innerHTML=valor;
            ////alert("ganó = "+ player);
            document.getElementById("ganador").innerHTML="El ganador es: "+player;
            stop=true;
            if(player=="X"){
                var perdedor="O";
            }else{
                var perdedor="X";
            }
            aprender(player);
        }else{
            if(cantidadDeJugadas>=9){
                aprender(player, "empate");
            }
        }

        if(player=="X"){
            player="O";
            if(maquina){
                autoPlay();
            }
        }else{
            player= "X";
        }        
    }else{
        if(maquina){
            autoPlay();
        }
    }
}

async function autoPlay(){
    //alert("autoplay");
    var numeroAleatorio = Math.floor(Math.random() * 9);      
    if(inteligente){
        numeroAleatorio = await IA(); 
    }
    //alert(numeroAleatorio);
    jugar(numeroAleatorio); 
}


async function IA(){
    //alert("IA");
    // Formación de jugada actual
    var jugadaActualMaquina = jugada["O"].join("");
    var jugadaActualPersona = jugada["X"].join("");
    var jugadaActual = jugadaActualMaquina.toString() + jugadaActualPersona.toString();

    // Rescate de jugadas
    var evaluar=leerJSONDelLocalStorage("jugadas");
    evaluar=ordenarObjetoPorValor(evaluar);
    var keys = Object.keys(evaluar);

    //Evaluación de jugadas
    var noSePuedeRealizar=0;
    var numero = Math.floor(Math.random() * 9);
    for (var j = 0; j < keys.length; j++) { // Va evaluando todas las jugadas de mejor a peor
        valor = evaluar[keys[j]];
        if(valor>0){ // esto aún es una buena jugada para analizar
            for(i=0;i<=8;i++){ // Evalúo cada una de las posiciones de juego
                if(keys[j][i]==1 && jugadaActual[i+9]==1){ // si la posicion está ocupada por la persona no vale la jugada y debo cortarla
                    noSePuedeRealizar++;
                    break; // no sería necesario seguir analizando y perder tiempo
                }
            }
            if(noSePuedeRealizar==0){ // si no se puede realizar no entra acá. sino llama a realizarJugada con la jugada a realizar que es posible
                numero = await realizarJugada(keys[j],jugadaActual);
                break;// para que no siga buscando jugada su ya lo encontro                
            }
        }
        noSePuedeRealizar=0;
    }
    if(j>=keys.length){
        inteligente=false; // si no existe la jugada apago la inteligencia
    }
    return(numero); // devuelvo el numero calculado

}

var jugandoAhora = 0;

function realizarJugada(aJugar, jugadaActual) {
    //alert("realizarJugada");
    var numero = 0;
    jugandoAhora = aJugar;
    var puntaje = -999999999999999999;
    var puntajeAux;
    var NumeroEnviar = 0;

    for (numero = 0; numero <= 8; numero++) { // ejecuto esto hasta encontrar una posición en la que pueda jugar
        if (aJugar[numero] == 1) { // me fijo que el número sea una de las posiciones en las que quiero jugar
            if (jugadaActual[numero] == 0) { // me fijo que la posición esté libre
                // dar puntaje más bajo posible a cada jugada
                puntajeAux = puntuar( sumar(jugadaActual,(10**(numero+8)).toString()) );
                if (puntajeAux > puntaje) {
                    NumeroEnviar = numero;
                    puntaje = puntajeAux;
                }
                break;
            }
        }
    }
    return NumeroEnviar;
}

async function puntuar(jugadaActual) {
    //alert("puntuar");
    // Rescate de jugadas
    var evaluar = leerJSONDelLocalStorage("jugadas");
    evaluar = ordenarObjetoPorValor(evaluar);
    var keys = Object.keys(evaluar);
    var coincidencias = 0;
    var cantidadJugada = 0;

    for (var j = keys.length - 1; j >= 0; j--) { // Va evaluando todas las jugadas de peor a mejor
        for (var i = 0; i <= 17; i++) { // Evalúo cada una de las posiciones de juego
            if (jugadaActual[i] == 1) { // si la jugada actual está en 1
                if (keys[j][i] == 1) { // y la guardada también. Puede que terminemos en esa solución
                    coincidencias++; // por lo que aumento la coincidencia
                }
                cantidadJugada++;
            }
        }
        if (coincidencias == cantidadJugada) { // Si en la jugada actual y la analizada coincide todo, es posible ese resultado
            break; // por lo que rompo el loop
        }
    }
    return evaluar[keys[j]]; // y regreso el menor puntaje posible
}

function guardarJSONEnLocalStorage(jsonData, nombreClave) {
    //alert("guardarJSONEnLocalStorage");
    var jsonString = JSON.stringify(jsonData);
    localStorage.clear(nombreClave);
    localStorage.setItem(nombreClave, jsonString);
}

function leerJSONDelLocalStorage(nombreClave) {
    //alert("leerJSONDelLocalStorage");
    var jsonString = localStorage.getItem(nombreClave);
    var jsonData = JSON.parse(jsonString);
    return jsonData;
  }


  function aprender(ganador, empate=0) {
    //alert("aprender");
    var jugadaMaquina = jugada["O"].join("");
    var jugadaPersona = jugada["X"].join("");
    var jugadaRecordar = jugadaMaquina.toString() + jugadaPersona.toString();

    var jugadas = leerJSONDelLocalStorage("jugadas") || {}; // Inicializar como objeto vacío si no hay valores en el LocalStorage

    if(empate==0){
        if(ganador=="X"){
            // jugadaRecordar debe restarle 1
            jugadas[jugadaRecordar] = (jugadas[jugadaRecordar] || 0) - 1; //jugandoAhora
            if(jugandoAhora!=0){
                jugadas[jugandoAhora] = (jugadas[jugandoAhora] || 0) - 1;
            }
        }
        if(ganador=="O"){
            // jugadaRecordar debe sumarle 1
            jugadas[jugadaRecordar] = (jugadas[jugadaRecordar] || 0) + 2;
        }        
    } else {
        jugadas[jugadaRecordar] = (jugadas[jugadaRecordar] || 0) + 1;
    }

    console.log(jugadas);
    guardarJSONEnLocalStorage(jugadas, "jugadas");
}


/*
0,1,2
3,4,5
6,7,8

0,3,6
1,4,7
2,5,8

0,4,8

2,4,6
*/
function isWinner(juego){
    //alert("isWinner");
    var val = juego[0]+juego[1]+juego[2];
    if(val==3){
        //horizontal,0
        return(["line-horizontal",0]);
        //return 1;
    }
    val = juego[3]+juego[4]+juego[5];
    if(val==3){
        //horizontal,3
        return(["line-horizontal",3]);
    }
    val = juego[6]+juego[7]+juego[8];
    if(val==3){
        //horizontal,6
        return(["line-horizontal",6]);
    }

    val = juego[0]+juego[3]+juego[6];
    if(val==3){
        //vertical,0
        return(["line-vertical",0]);
    }
    val = juego[1]+juego[4]+juego[7];
    if(val==3){
        //vertical,1
        return(["line-vertical",1]);
    }
    val = juego[2]+juego[5]+juego[8];
    if(val==3){
        //vertical,2
        return(["line-vertical",2]);
    }

    val = juego[0]+juego[4]+juego[8];
    if(val==3){
        //cross1,0
        return(["line-cross1",0]);
    }

    val = juego[2]+juego[4]+juego[6];
    if(val==3){
        //cross2,2
        return(["line-cross2",2]);
    }
}



function ordenarObjetoPorValor(objeto) {
    //alert("ordenarObjetoPorValor");
    // Crear un array de pares clave-valor del objeto
    const arrayPares = Object.entries(objeto);
  
    // Ordenar el array de pares por el valor en orden descendente
    arrayPares.sort((a, b) => b[1] - a[1]);
  
    // Crear un nuevo objeto ordenado
    const objetoOrdenado = {};
    for (let i = 0; i < arrayPares.length; i++) {
      const [clave, valor] = arrayPares[i];
      objetoOrdenado[clave] = valor;
    }
  
    return objetoOrdenado;
  }




function sumar(cadena1, cadena2) {
  // Asegurarse de que ambas cadenas tengan la misma longitud
  if (cadena1.length < cadena2.length) {
    [cadena1, cadena2] = [cadena2, cadena1]; // Intercambiar las cadenas si cadena2 es más larga
  }

  // Convertir las cadenas en arreglos de caracteres y revertirlos para facilitar la suma
  let arreglo1 = cadena1.split("").reverse();
  let arreglo2 = cadena2.split("").reverse();

  let resultado = [];
  let lleva = 0;

  for (let i = 0; i < arreglo1.length; i++) {
    let digito1 = parseInt(arreglo1[i]);
    let digito2 = i < arreglo2.length ? parseInt(arreglo2[i]) : 0;

    let suma = digito1 + digito2 + lleva;
    lleva = Math.floor(suma / 10);
    resultado.push((suma % 10).toString());
  }

  if (lleva > 0) {
    resultado.push(lleva.toString());
  }

  // Revertir el resultado y unirlo en una sola cadena
  return resultado.reverse().join("");
}