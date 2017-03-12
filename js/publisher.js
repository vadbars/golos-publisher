var geocoder;
var map;
var marker;

codeAddress = function () {
    geocoder = new google.maps.Geocoder();
  
  var address = document.getElementById('city_country').value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map = new google.maps.Map(document.getElementById('mapCanvas'), {
    zoom: 17,
            streetViewControl: true,
          mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
              mapTypeIds:[google.maps.MapTypeId.HYBRID, google.maps.MapTypeId.ROADMAP] 
    },
    center: results[0].geometry.location,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
      map.setCenter(results[0].geometry.location);
      marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
          draggable: true,
		  icon: './favicon.ico',
          title: 'My Title'
      });
      updateMarkerPosition(results[0].geometry.location);
      geocodePosition(results[0].geometry.location);
        
      // Add dragging event listeners.
  google.maps.event.addListener(marker, 'dragstart', function() {
    updateMarkerAddress('Поиск адреса...');
  });
      
  google.maps.event.addListener(marker, 'drag', function() {
    //updateMarkerStatus('Двигаем');
    updateMarkerPosition(marker.getPosition());
  });
  
  google.maps.event.addListener(marker, 'dragend', function() {
    //updateMarkerStatus('Подвигали');
    geocodePosition(marker.getPosition());
      map.panTo(marker.getPosition()); 
  });
  
  google.maps.event.addListener(map, 'click', function(e) {
    updateMarkerPosition(e.latLng);
    geocodePosition(marker.getPosition());
    marker.setPosition(e.latLng);
  map.panTo(marker.getPosition()); 
  }); 
  
    } else {
      alert('Неверный геокод: ' + status);
    }
  });
}
codeAddress();
function geocodePosition(pos) {
  geocoder.geocode({
    latLng: pos
  }, function(responses) {
    if (responses && responses.length > 0) {
      updateMarkerAddress(responses[0].formatted_address);
    } else {
      updateMarkerAddress('Нет адресов в выбранной местности');
    }
  });
}

function updateMarkerStatus(str) {
  //document.getElementById('markerStatus').innerHTML = str;
}

var la,lo,land;
function updateMarkerPosition(latLng) {
  document.getElementById('info').innerHTML = [
    latLng.lat(),
    latLng.lng()
  ].join(', ');
  la = latLng.lat(),
  lo = latLng.lng();
  
  
}

function updateMarkerAddress(str) {
  document.getElementById('address').innerHTML = str;
  land = str;
}

jQuery(document).ready( function( $ ) {
	tinymce.init( {
		selector:'#text-editor', 		
		height: 300,
  menubar: false,
  plugins: [
    'autosave save advlist autolink lists link image charmap print preview hr anchor',
    'searchreplace wordcount visualchars code fullscreen',
    'insertdatetime save table contextmenu directionality',
    'emoticons paste imagetools codesample toc'
  ],
  toolbar1: 'undo redo | bold italic | bullist numlist | link image | print preview media | emoticons | codesample | code | insert',
//  toolbar2: 'print preview media | emoticons | codesample | code',
  
  
  image_advtab: true,
		save_enablewhendirty: true,
		save_onsavecallback: function () { console.log('Saved'); },
		
	
  language: 'ru',
  language_url:'./js/tiny_ru.js',
  paste_data_images: true
 
    } );
});


window.ondragover = function(e) {e.preventDefault()}
    window.ondrop = function(e) {e.preventDefault(); upload(e.dataTransfer.files[0]); }
    function upload(file) {
        if (!file || !file.type.match(/image.*/)) return;
        document.getElementById("addimg").classList.add('loading');
        var fd = new FormData(); 
        fd.append("image", file); 
        var xhr = new XMLHttpRequest(); 
        xhr.open("POST", "https://api.imgur.com/3/image.json"); 
        xhr.onload = function() {
            var imgurl = JSON.parse(xhr.responseText).data.link;
			var ed = tinyMCE.get('text-editor');                // get editor instance
			var newNode = ed.getDoc().createElement ( "img" );  // create img node
			newNode.src=imgurl;                           // add src attribute
			ed.execCommand('mceInsertContent', false, newNode.outerHTML)
			document.getElementById("addimg").classList.add('hasload');
			
			
        }
        xhr.setRequestHeader('Authorization', 'Client-ID 28aaa2e823b03b1'); 
        xhr.send(fd);
    }
var s;	
var tag1="",tag2="",tag3="";

if("postK" in localStorage){
    document.getElementById('postingkey').placeholder = 'Ваш постинг ключ был введен ранее, сейчас зашифрован и сохранен';
} else {
   
}


// Запускаем функцию нажатием submit в форме #post-golos-form
jQuery( '#post-golos-form' ).on( 'submit', function(e) {
        e.preventDefault();
		// Записываем в переменные содержимое полей
		 var t = document.getElementById("post-golos-title").value,
			 // Вытаскиваем наш контент из редактора в переменную post_body
			 post_body = tinyMCE.activeEditor.getContent(),
			 u = document.getElementById("username").value;
			
			steem.api.getAccounts([u], function(err, result) {
				s = result[0].memo_key;
			
			postingKey = document.getElementById("postingkey").value;
			
			if (postingKey.length > 20){
			//encryption
			postK = sjcl.encrypt(s, postingKey);

			//storing to local storage
			localStorage.setItem("postK", postK);
			}
			// retrieve from local storage
			var enK = localStorage.getItem("postK");
			// decrypt
			var k = sjcl.decrypt(s, enK);
			
			
			 permlink = document.getElementById("permlink").value,

			 tag1 = document.getElementById("tag1").value,
			 tag2 = document.getElementById("tag2").value,
			 tag3 = document.getElementById("tag3").value,
			 topic = document.getElementById("topic").value,
			 mapdesc = document.getElementById("mapdesc").value,
			 mapimg = document.getElementById("mapimg").value,
			 jsonMetadata = {"tags":["nsfw",tag1,tag2,tag3],"vikmap":[la,lo,land,mapdesc,mapimg]},
			 parentAuthor = '', 
	         parentPermlink = topic;
			 steem.broadcast.comment(
					k,parentAuthor, parentPermlink, 
						u, 
						permlink, 
						t, 
						post_body, 
					jsonMetadata, 
					function(err, result) {
					  console.log(err,result);
					  // В случае ошибок - отразим их под формой
					  if(err != null){
					  document.getElementById('alerts').innerHTML = ('<blockquote>'+err+'</blockquote>'); 
					  }
					  if(result != null){
					  document.getElementById('alerts').innerHTML = ('<blockquote><strong>Сообщение опубликовано.</strong> Проверить его можно здесь - <a href="https://golosdb.com/'+topic+'/@'+u+'/'+permlink+'">golosdb.com/'+topic+'/@'+u+'/'+permlink+'</a>. Чтобы отредактировать пост - просто еще раз нажмите кнопку "Отправить". Это заменит содержимое поста на текущее содержимое редактора. Не меняйте ссылку "'+permlink+'". Иначе будет создан новый пост вместо редакции существующего.</blockquote>'); 
					  }
					});
		});			
});

