var player= "X";
var jugada = { "X": [0, 0, 0, 0, 0, 0, 0, 0, 0], "O": [0, 0, 0, 0, 0, 0, 0, 0, 0] };
var stop=false;
var maquina=true;
var inteligente=true;
var cantidadDeJugadas=0;

/*
jugadaGuardar
    1564370
    valor
*/
var KeyGuardar="";

function jugar(numero){
    ////alert("jugar");
    if(stop){
        return;
    }

    var valor = document.getElementsByClassName("item")[numero].innerHTML;
    if(valor!="X" && valor!="O"){
        cantidadDeJugadas++;
        KeyGuardar = KeyGuardar+numero;
        document.getElementsByClassName("item")[numero].innerHTML=player;
        jugada[player][numero]=1;
        var win=isWinner(jugada[player]);
        if(win){
            valor = document.getElementsByClassName("item")[win[1]].innerHTML;
            valor = valor + '<div class="'+win[0]+'"></div>';
            document.getElementsByClassName("item")[win[1]].innerHTML=valor;
            //////alert("ganó = "+ player);
            document.getElementById("ganador").innerHTML="El ganador es: "+player;
            stop=true;
            if(player=="X"){
                var perdedor="O";
                aprender(KeyGuardar, -2);
            }else{
                var perdedor="X";
                aprender(KeyGuardar, 2);
            }
        }else{
            if(cantidadDeJugadas>=9){
                aprender(KeyGuardar, 1);
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
    ////alert("autoplay");
    var numeroAleatorio = Math.floor(Math.random() * 9);      
    if(inteligente){
        numeroAleatorio = await IAOfensiva(); 
    }
    ////alert(numeroAleatorio);
    jugar(numeroAleatorio); 
}


async function IAOfensiva() {
    //alert("IAOfensiva");
    //var jugadas = leerJSONDelLocalStorage("jugadas") || {};

    var jugadas = localStorage.jugadas || {};
    //jugadas = ordenarObjetoPorValor(jugadas);
    var keys = Object.keys(jugadas);
    var keys = ordenarKeysPorValor(jugadas);
    jugadas = JSON.parse(jugadas);
    //console.log("jugadas => " + jugadas);
    //console.log("keys => " + keys);

    var numero = 0;
    //console.log("numero => " + numero);
    //alert("antes del for");

    //console.log("         Preparo el FOR     ");
    //console.log("keys.length => " + keys.length);
    for (var i = 0; i < keys.length; i++) { // recorremos todos los keys del mejor al peor
        var RecorteJugadas = keys[i].substring(0, KeyGuardar.length);
        //alert(RecorteJugadas + " == " + KeyGuardar);
        //alert("i= "+i);
        //alert("keys[i]= "+keys[i]);
        //alert("jugadas[keys[i]]= "+jugadas[(keys[i]).toString()]);
        //console.log("jugadas => " + jugadas);
        //alert("evaluo jugada = "+i);
        if (RecorteJugadas == KeyGuardar) { // es una jugada posible
            //alert("Es posible realizar la jugada");
            //alert(jugadas[keys[i]] + " >= 0");
            if (jugadas[keys[i]] >= 0) { // es una jugada buena   
                //alert(jugadas[keys[i]] + " >= 0");
                numero = keys[i][KeyGuardar.length];
                //alert("es una buena jugada y juego ="+numero);
                //alert("el numero a mandar es = " + numero);
                break;
            }
            //alert(jugadas[keys[i]] + " < 0");
            if (jugadas[keys[i]] < 0) { // No jugarla porque es mala. Puedo apagar inteligencia
                //alert("No encontré una buena jugada");
                //alert(jugadas[keys[i]] + " < 0");
                //alert("entro al if de la condicion anterior");
                //inteligente=false;
                //alert("el numero a mandar es = " + numero);
                numero = await IADefensiva(numero); // Esperar a que se resuelva IADefensiva
                alert("entro al jugada defensiva ="+numero);
                break;
            }
        }
    }
    //alert("el numero que mando es = " + numero);
    return numero;
}


async function IADefensiva(numero=0){
    //alert("IADefensiva");
    //var jugadas = leerJSONDelLocalStorage("jugadas") || {};

    var jugadas = localStorage.jugadas || {};
    //jugadas = ordenarObjetoPorValor(jugadas);
    var keys = Object.keys(jugadas);
    var keys = ordenarKeysPorValor(jugadas);
    jugadas = JSON.parse(jugadas);
    //console.log("jugadas => " + jugadas);
    //console.log("keys => " + keys);

    for (var i = 0; i <= 8; i++) {
        if (KeyGuardar[i] == numero) {
            numero++;
        }
    }


    for (var i = keys.length - 1; i >= 0; i--){// recorremos todos los keys del peor al mejor
        //alert("evaluamos jugada: "+i+" jugando numero: "+numero);
        var KeyGuardarAux = KeyGuardar.toString() + numero.toString();
        var RecorteJugadas = keys[i].substring(0, KeyGuardarAux.length);
        
        if (RecorteJugadas == KeyGuardarAux){// es una jugada posible
            //alert("es una jugada posible");
            if (jugadas[keys[i]] < 0){ // No jugarla porque es mala.Puedo apagar inteligencia
                //alert("pero es una mala jugada");
                numero++;
                for(var j=0; j<=8; j++){ // esto de acá está funcionando mal para no elegir 
                    if(KeyGuardar[j]==numero){
                        //alert("Numeros jugados"+KeyGuardar+"ya se jugó el : "+numero);
                        numero++;
                        j=-1;
                    }
                }
                //alert("elegí el nuevo numero: "+numero);
                i=keys.length;
            } else{
                //alert("Esta jugada no se hizo aún");
            }
        }
    }
    if(numero>8){
        inteligente=false;
        numero=8;
        alert("apague la inteligencia");
        //autoPlay()
    }
    alert("el numero que mando es = "+numero);
    return(numero);
}


function ordenarKeysPorValor(jsonString) {
    const objeto = JSON.parse(jsonString);
    const claves = Object.keys(objeto);
    const valores = Object.values(objeto);
  
    const pares = claves.map((clave, index) => [clave, valores[index]]);
    pares.sort((a, b) => b[1] - a[1]);
  
    const keysOrdenadas = pares.map((par) => par[0]);
  
    return keysOrdenadas;
  }


function guardarJSONEnLocalStorage(jsonData, nombreClave) {
    //alert("guardarJSONEnLocalStorage");
    var jsonString = JSON.stringify(jsonData);
    console.log(jsonString);
    localStorage.clear(nombreClave);
    console.log(localStorage);
    //alert("local storage borrado");
    localStorage.setItem(nombreClave, jsonString);
    console.log(localStorage);
    //alert("local storage vuelto a cargar");
}

function leerJSONDelLocalStorage(nombreClave) {
    ////alert("leerJSONDelLocalStorage");
    var jsonString = localStorage.getItem(nombreClave);
    var jsonData = JSON.parse(jsonString);
    return jsonData;
}


function aprender(guardar, valor) {
    if(valor==0){
        //alert(guardar);
    }
    var jugadas = leerJSONDelLocalStorage("jugadas") || {};
    if(valor==0){
        console.log(jugadas);
        //alert("jugadas antiguas");
    }
    jugadas[guardar] = (jugadas[guardar] || 0) + valor;
    if(valor==0){
        console.log(jugadas);
        //alert("jugadas nuevas");
    }
    //console.log(jugadas);
    guardarJSONEnLocalStorage(jugadas, "jugadas");
}



function isWinner(juego){
    ////alert("isWinner");
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
    ////alert("ordenarObjetoPorValor");
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