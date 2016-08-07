

var jmap;
var ge;
var map = null;
var groundOverlay;
var currentKmlObjects = {
  'red': null
};
var lod1;
var lod3;
var groundOverlayArray = [];
var networkLink;
var placemark;
var vceCount = 0;
google.load("earth", "1");
var east;
var west;
var north;
var south;
var lat;
var lng;


function init() {
  google.earth.createInstance('mapGE', initCallback, failureCallback);

  gss();

  document.getElementById('dmap3d').style.border = '1px solid #ff0000';

}




function lod1() {


  var lookAt = ge.getView().copyAsLookAt(ge.ALTITUDE_RELATIVE_TO_GROUND);

  var lon = lookAt.getLongitude();
  var lat = lookAt.getLatitude();
  var range = lookAt.getRange();

  //lookat(lat,lon, 0, 0, 40, 800);

  //alert('x');

  var isi = 'lod1kml(\'lod1\')';

  setTimeout(isi,2000);

  var isi = 'lod3kml(\'lod1\')';

  setTimeout(isi,2000);


}


function lod1kml() {

	var kmlUrl = 'http://167.205.108.138/petakampus/tes_create_kml.php';

  // fetch the KML
  google.earth.fetchKml(ge, kmlUrl, function(kmlObject) {
    // NOTE: we still have access to the 'file' variable (via JS closures)

    if (kmlObject) {
      // show it on Earth
      lod1 = kmlObject;
      ge.getFeatures().appendChild(kmlObject);


      google.earth.addEventListener(kmlObject, 'click', function(event) {
      // event.preventDefault();
       var kmlPlacemark = event.getTarget();
       //alert (kmlPlacemark.getId());
       var gid = kmlPlacemark.getId();

       var uri = 'lantai_gmap.php?gid='+gid;
       window.open(uri,'lantai_gmap','','')

      });


    } else {
      // bad KML
      lod1 = null;

      // wrap alerts in API callbacks and event handlers
      // in a setTimeout to prevent deadlock in some browsers
      setTimeout(function() {
        alert('Bad or null KML.');
      }, 0);

    }
  });
}


function lod3kml() {

	var kmlUrl = 'http://167.205.108.138/petakampus/magister_geodesi2/doc.kml';

  // fetch the KML
  google.earth.fetchKml(ge, kmlUrl, function(kmlObject) {
    // NOTE: we still have access to the 'file' variable (via JS closures)

    if (kmlObject) {
      // show it on Earth
      lod3 = kmlObject;
      ge.getFeatures().appendChild(kmlObject);

      lod3.setVisibility(false);


    } else {
      // bad KML
      lod3 = null;

      // wrap alerts in API callbacks and event handlers
      // in a setTimeout to prevent deadlock in some browsers
      setTimeout(function() {
        alert('Bad or null KML.');
      }, 0);

    }
  });
}


function initCallback(instance) {
  ge = instance;
  ge.getWindow().setVisibility(true);

  // add a navigation control
  ge.getNavigationControl().setVisibility(ge.VISIBILITY_AUTO);

  // add some layers
  ge.getLayerRoot().enableLayerById(ge.LAYER_BORDERS, true);
  ge.getLayerRoot().enableLayerById(ge.LAYER_ROADS, true);


  createPlacemark(-6.89095971502547,107.612086136494,1);createPlacemark(-6.89096682479847,107.611612375163,2);createPlacemark(-6.89054764091116,107.611592908006,3);createPlacemark(-6.8898693033084,107.611541268571,4);createPlacemark(-6.88919964620882,107.611554782997,5);createPlacemark(-6.88873517981829,107.611554953047,6);createPlacemark(-6.88818166595781,107.611480487688,7);createPlacemark(-6.88787451050303,107.611466147032,8);createPlacemark(-6.88824456425422,107.612537831632,9);createPlacemark(-6.88868360024198,107.612559225001,10);createPlacemark(-6.88921350162842,107.612436834564,11);createPlacemark(-6.88956754886111,107.612466036617,12);createPlacemark(-6.88783914823588,107.610353577826,13);createPlacemark(-6.88826268213259,107.610354348795,14);createPlacemark(-6.8887004615666,107.610361093549,15);createPlacemark(-6.88917435691472,107.610365314309,16);createPlacemark(-6.88987856687089,107.610369168022,17);createPlacemark(-6.89026799265725,107.610360583918,18);createPlacemark(-6.88991744702667,107.609007444231,19);createPlacemark(-6.88963053480091,107.609007746695,20);createPlacemark(-6.88916335379327,107.609011711118,21);createPlacemark(-6.88870450944346,107.609279517673,22);createPlacemark(-6.88788626097673,107.609367031591,23);createPlacemark(-6.88795662238228,107.608466759159,24);createPlacemark(-6.88915190290197,107.608250812899,25);createPlacemark(-6.88961358106001,107.608231897495,26);createPlacemark(-6.89012955118751,107.60824963907,27);createPlacemark(-6.89134666335721,107.612185083157,28);createPlacemark(-6.89203538003254,107.612212628713,29);createPlacemark(-6.89247218055045,107.611929087716,30);createPlacemark(-6.89259661745596,107.6114054558,31);createPlacemark(-6.89286842469392,107.611399258363,32);createPlacemark(-6.89258721270746,107.610729211894,33);createPlacemark(-6.89261643428043,107.61036794125,34);createPlacemark(-6.89306080001441,107.610363384279,35);createPlacemark(-6.89265851936825,107.608909761203,36);createPlacemark(-6.89293376820472,107.608999821195,37);createPlacemark(-6.89238364584663,107.608306104229,38);createPlacemark(-6.89167281794935,107.608191761249,39);createPlacemark(-6.89103874614558,107.608221850173,40);createPlacemark(-6.89105193052366,107.608706620137,41);createPlacemark(-6.89105198412587,107.609713894732,42);createPlacemark(-6.89190953356698,107.609753718021,43);createPlacemark(-6.89193209044931,107.610419715918,44);createPlacemark(-6.89136101867347,107.610388033462,45);createPlacemark(-6.89103366332095,107.610374124616,46);createPlacemark(-6.8910147784173,107.611016709077,47);createPlacemark(-6.89145116167175,107.611024225442,48);createPlacemark(-6.89187858203255,107.611051269971,49);

 lookat(-6.8907, 107.6102, 0, 0, 50, 800);

 var l_photo = document.getElementById("l_photo");
 l_photo.onclick = function() {
      if (l_photo.checked) {
            networkLink.setVisibility(true);
      } else {
            networkLink.setVisibility(false);
      }
 }

 var l_lod1 = document.getElementById("l_lod1");
 l_lod1.onclick = function() {
      if (l_lod1.checked) {
            lod1.setVisibility(true);
      } else {
            lod1.setVisibility(false);
      }
 }

 var l_lod3 = document.getElementById("l_lod3");
 l_lod3.onclick = function() {
      if (l_lod3.checked) {
            lod3.setVisibility(true);
      } else {
            lod3.setVisibility(false);
      }
 }

 uav_photo();

 lod1();

}

function uav_photo() {

   networkLink = ge.createNetworkLink('');
   networkLink.setDescription('NetworkLink open to fetched content');
   networkLink.setName('Open NetworkLink');
   networkLink.setFlyToView(true);
   // NetworkLink/Link
   var link = ge.createLink('');
   // **Set url of kml here:
   link.setHref('http://167.205.108.138/petakampus/uav_photo/itbv2png/doc.kml');
   networkLink.setLink(link);
   // add the network link to earth
   ge.getFeatures().appendChild(networkLink);

   networkLink.setVisibility(false);

}

function createPlacemark(lat,lon,id) {
  placemark = ge.createPlacemark('');
  //placemark.setName("<a>a</a>");

  placemark.setDescription('Pano '+id);
  ge.getFeatures().appendChild(placemark);

  // Create style map for placemark
  var icon = ge.createIcon('');
  icon.setHref('http://maps.google.com/mapfiles/kml/paddle/red-circle.png');
  var style = ge.createStyle('');
  style.getIconStyle().setIcon(icon);
  placemark.setStyleSelector(style);

  // Create point
  var point = ge.createPoint('');
  point.setLatitude(lat);
  point.setLongitude(lon);
  placemark.setGeometry(point);

  google.earth.addEventListener(placemark, 'click', function(event) {
   bukapano(id);
  });

}


function bukapano(gid) {

  //alert(gid);

	m1 = document.getElementById('mapGE').style.height;
	m1 = m1.substr(0,m1.length-1);
	//alert(m1);
	document.getElementById('mapGE').style.height = '50%';
	p = 100 - 50;
	//alert(p);
	document.getElementById('panoramic').style.height = p +'%';

  //document.getElementById('panoramic').innerHTML = "<div style=''><br>&nbsp;&nbsp;&nbsp;Silahkan pilih spot panoramic di peta ...</div>";


   var request;
   try
   {
     //Firefox, Opera 8.0+, Safari
     request = new XMLHttpRequest();
   }
   catch(e)
   {
     //Internet Explorer
     try
     {
       request = new ActiveXObject("Msxml2.XMLHTTP");
     }
     catch(e)
     {
       try
       {
         request = new ActiveXObject("Microsoft.XMLHTTP");
       }
       catch(e)
       {
         alert("Your browser does not support AJAX!")
         return false;
       }
     }
   }

   var uri = "pano_simple.php?gid=" + gid;

   request.open("GET", uri, true);
   request.send();

   request.onreadystatechange = function() {
    if(request.readyState == 4 && request.status==200) {
     document.getElementById('panoramic').innerHTML = request.responseText;
    }
   };




}

function tutuppano() {
	        document.getElementById('mapGE').style.height = '100%';
	        document.getElementById('panoramic').style.height = '0%';
	        document.getElementById('panoramic').innerHTML = '';
}

function lookat(lat,lon,alt,heading,tilt,range){

    var la = ge.createLookAt('');
    la.set(lat, lon, alt, ge.ALTITUDE_RELATIVE_TO_GROUND, heading, tilt, range);
    ge.getView().setAbstractView(la);

}

function lookat2(lat,lon,alt,heading,tilt,range,id_gedung,id_lantai,gid){

    var la = ge.createLookAt('');
    la.set(lat, lon, alt, ge.ALTITUDE_RELATIVE_TO_GROUND, heading, tilt, range);
    ge.getView().setAbstractView(la);

    //alert(gid);

    var uri = 'lantai_gmap2.php?id_gedung='+id_gedung+'&id_lantai='+id_lantai+'&gid='+gid;
    //alert(uri);

    window.open(uri,'lantai_gmap','','')

}



function failureCallback(errorCode) {
}

    
