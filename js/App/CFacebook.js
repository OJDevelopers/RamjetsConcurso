OAuth.initialize('pPa3YdrYaklS4lVCyBBqi2NLVsI');
var host = "http://ramjetspuwebapi.azurewebsites.net/api";

function QueryString() {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = pair[1];
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]], pair[1] ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(pair[1]);
    }
  } 
    return query_string;
}

function PublicarEnRedes (provider, mensaje) {
	var DataMessage = {};
	var urlApi = "";
	var MensajeFInal = "";

	if(provider == "facebook")
	{
		DataMessage.message = mensaje;
		urlApi = "https://graph.facebook.com/"+localStorage["IdFacebook"]+"/feed";
		MensajeFInal = "Se ha publicado correctamente en tu muro de facebook";
	}
	else if(provider == "twitter")
	{
		DataMessage.status = mensaje;
		DataMessage.trim_user = true;
		urlApi = "https://api.twitter.com/1.1/statuses/update.json";
		MensajeFInal = "Tu tweet se ha publicado correctamente.";
	}

	OAuth.popup(provider,{cache: true})
		.done(function(result) {

			result.post(urlApi, {data:DataMessage})
		    .done(function (response) {
		        console.log(MensajeFInal);
		    })
		    .fail(function (err) {
		        console.log('No hemos podido publicar el contenido.\nIntentalo de nuevo mas tarde.\nReferencia Error: \n'+JSON.stringify(err));
		    });
			
		})
		.fail(function (err) {
		  //handle error with err
	});

}

angular.module('FacebookConnetc', ['chieffancypants.loadingBar', 'ngAnimate','ngDialog']).config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
  })

.controller('AccesInfo', function ($scope, $http,cfpLoadingBar,ngDialog){
	$scope.UsuarioFacebook = {
		id:"",
		name:"",
		lastname:"",
		image:""
	};

	var Provider = QueryString();

	$scope.start = function() {
      cfpLoadingBar.start();
    };

    $scope.complete = function () {
      cfpLoadingBar.complete();
    };

    $scope.VerificarUsuario = function (id, provider) {
    	var Variables = QueryString();
    	switch(provider)
    	{
    		case "facebook":
    			$http.get(host+"/participants/Facebook/"+id+"/"+Variables.advertising)
    			.success(function(data, status, headers, config) {
					if(data.length == 0)
					{
						ngDialog.open({ template: 'ComfirmLogin', controller: 'NoRegistrado',className: 'ngdialog-theme-default'});
					}
				})
				.error(function(data, status, headers, config) {
				    var algo = data;
				});
    			break;
    		case "twitter":
    			$http.get(host+"/participants/Twitter/"+id+"/"+Variables.advertising)
    			.success(function(data, status, headers, config) {
					if(data.length == 0)
					{
						ngDialog.open({ template: 'ComfirmLogin', controller: 'NoRegistrado', className: 'ngdialog-theme-default'});
					}
				})
				.error(function(data, status, headers, config) {
				    var algo = data;
				});
    			break;
    	}	
    };


    $scope.start();
    //Verifico la promocion
    $http.get(host+"/advertising/"+Provider.advertising)
	.success(function(data, status, headers, config) {
		if(data.length == 0)
		{
			//ngDialog.open({ template: 'ComfirmLogin', controller: 'NoRegistrado',className: 'ngdialog-theme-default'});
			alert('La promocion es invalida o ya no se encuentra actiiva.');
			cfpLoadingBar.complete();
		}
		else
		{
			localStorage['RedArtistaFacebook'] = data.TwitterPerfil;
			localStorage['TokenOauth'] = data.TokenApp;
			localStorage['Premios'] = JSON.stringify(data.Awards);
			alert('Has entrado a la promocion '+data.Name);
			$scope.complete();
			$scope.IniciarUsuario();
		}
	})
	.error(function(data, status, headers, config) {
	    var algo = data;
	});

    $scope.IniciarUsuario = function() {
    	cfpLoadingBar.start();
    	// body...
		OAuth.popup(Provider.provider,{cache: true})
			.done(function(result) {

				if(Provider.provider == "facebook")
				{	
					//result.get("/me?fields=picture,first_name,last_name,id&type=large")
					result.me()
				    .done(function (response) {
				    	//alert('Bienvenido: ' + response.name + '\nTu usuario es:' response.user);
				        //alert('Bienvenido: ' + response.name + ' a Ramjets!.');
				        $scope.UsuarioFacebook.name = response.firstname;
						$scope.UsuarioFacebook.lastname = response.lastname;
						$scope.UsuarioFacebook.id = response.id;
						$scope.UsuarioFacebook.image = response.avatar;

						localStorage["Name"] = response.name;
						localStorage["Imagen"] = response.avatar;
				        localStorage["IdFacebook"] = response.id;
				        
				        $scope.$apply();
				        cfpLoadingBar.complete();
				        $scope.VerificarUsuario(response.id, Provider.provider);
				    })
				    .fail(function (err) {
				        alert("Ha ocurrido un error.\nEl error relasionado es el siguiente:\n"+JSON.stringify(err));
				    	$scope.complete();
				        //handle error with err
				    });
					//use result.access_token in your API request 
					//or use result.get|post|put|del|patch|me methods (see below)
					//alert('token: ' + result.access_token);
				}
				else if(Provider.provider == "twitter")
				{
					result.me()
					.done(function (response) {
						// body...
						$scope.UsuarioFacebook.name = response.alias;
						$scope.UsuarioFacebook.lastname = response.name;
						$scope.UsuarioFacebook.id = response.id;
						$scope.UsuarioFacebook.image = response.avatar;

						localStorage["Name"] = response.name;
						localStorage["Imagen"] = response.avatar;
						localStorage["IdTwitter"] = response.id;

						$scope.$apply();
				        $scope.complete();
				        $scope.VerificarUsuario(response.id, Provider.provider);
					})
					.fail(function (err) {
						// body...
						alert("Ha ocurrido un error.\nEl error relasionado es el siguiente:\n"+JSON.stringify(err));
				    	$scope.complete();
					});
				}
				
			})
			.fail(function (err) {
				alert("Ha ocurrido un error.\nEl error relasionado es el siguiente:\n"+JSON.stringify(err));
			    $scope.complete();
			  //handle error with err
		});
    }
})
.controller('ParticipantsActions', function ($scope, $http,$timeout,cfpLoadingBar){
	var IdUsuario = "";


})
.controller('NoRegistrado', function ($scope,$http,ngDialog,cfpLoadingBar){
	var Usuario = {
		Name: "",
		IdAdvertising: "",
		IdFacebook: "",
		IdTwitter: "",
		Image: ""
	};

	var Provider = QueryString();
	$scope.provider = Provider.provider;

	$scope.NombreBoton = "";

	switch(Provider.provider)
	{
		case "facebook":
			$scope.NombreBoton = "LogIn Twitter";
			$scope.RedRegis="Twitter";
			$scope.ClickLogIn = function(){
				cfpLoadingBar.start();
				$scope.NoRegisLogIn("twitter");
			};		
			break;
		case "twitter":
			$scope.NombreBoton = "LogIn Facebook";
			$scope.RedRegis="Facebook";
			$scope.ClickLogIn = function(){
				cfpLoadingBar.start();
				$scope.NoRegisLogIn("facebook");
			};
			break;
	}
	$scope.btnVotar = function(){
		ngDialog.close();
	};

	$scope.NoRegisLogIn = function (provider) {
		var Variables = QueryString();
		
		OAuth.popup(provider,{cache: true})
			.done(function(result) {	
				//result.get("/me?fields=picture,first_name,last_name,id&type=large")
				result.me()
			    .done(function (response) {
			    	cfpLoadingBar.complete();
			    	$scope.ConsultarUsuario(provider, response.id, Variables.advertising);
			    })
			    .fail(function (err) {
			    	cfpLoadingBar.complete();
			        alert("Ha ocurrido un error.\nEl error relasionado es el siguiente:\n"+JSON.stringify(err));
			        //handle error with err
			    });
				
			})
			.fail(function (err) {
			    cfpLoadingBar.complete();
				alert("Ha ocurrido un error.\nEl error relasionado es el siguiente:\n"+JSON.stringify(err));
			  //handle error with err
		});
	};

	$scope.ClickGuardar = function() {
		var Variables = QueryString();
		$scope.GuardarParticipante(null,true,Variables.advertising,Variables.provider,"");
	}

	$scope.GuardarParticipante = function (datos, nuevo, advertising, provider,id) {
		cfpLoadingBar.start();
		var mens = "";
		var ProviderPublicar = "";
		if(provider == "facebook")
		{
			mens = "Prueba de Tweet oculto concurso Ramjets. https://www.google.com";
			ProviderPublicar = "twitter";
		}
		else if (provider == "twitter")
		{
			mens = "Prueba publicacion oculta concurso Ramjets. https://www.google.com";
			ProviderPublicar = "facebook";
		}

		if(nuevo)
		{
			Usuario.Name = localStorage["Name"];
			Usuario.IdFacebook = localStorage["IdFacebook"];
			Usuario.IdTwitter = localStorage["IdTwitter"];
			Usuario.IdAdvertising = advertising;
			Usuario.Image = localStorage["Imagen"];


			$http.post(host+'/participants/Insert', Usuario)
			.success(function(data, status, headers, config) {
				alert("Has sido registrado con exito");
				PublicarEnRedes(ProviderPublicar, mens) ;
				cfpLoadingBar.complete();
			})
			.error(function(data, status, headers, config) {
				alert("Ha Ocurrido un error");
				cfpLoadingBar.complete();
			});


			
		}
		else
		{
			if(provider == "facebook")
			{
				datos.IdTwitter = id;
			}
			else if (provider == "twitter")
			{
				datos.IdFacebook = id;
			}

			$http.put(host+'/participants/Update/'+datos._id, datos)
			.success(function(data, status, headers, config) {
				alert("Datos actualizados con exito");
				PublicarEnRedes(ProviderPublicar, mens) ;
				cfpLoadingBar.complete();
			})
			.error(function(data, status, headers, config) {
				alert("Ha Ocurrido un error");
				cfpLoadingBar.complete();
			});
		}

		
		ngDialog.close();
	}

	$scope.ConsultarUsuario = function (provider, id, Advertising) {
		cfpLoadingBar.start();
		switch(provider)
    	{
    		case "facebook":
    			$http.get(host+"/participants/Facebook/"+id+"/"+Advertising)
    			.success(function(data, status, headers, config) {
    				cfpLoadingBar.complete();
					if(data.length == 0)
					{
						//ngDialog.open({ template: 'ComfirmLogin', controller: 'NoRegistrado', data: {foo: 'some data'} });
						alert('No hemos encontrado ningun usuario con tu cuenta!');
					}
					else
					{
						$scope.GuardarParticipante(data[0],false,Advertising,provider,localStorage["IdTwitter"]);
					}
				})
				.error(function(data, status, headers, config) {
				    var algo = data;
				});
    			break;
    		case "twitter":
    			$http.get(host+"/participants/Twitter/"+id+"/"+Advertising)
    			.success(function(data, status, headers, config) {
    				cfpLoadingBar.complete();
					if(data.length == 0)
					{
						//ngDialog.open({ template: 'ComfirmLogin', controller: 'NoRegistrado', data: {foo: 'some data'} });
						alert('No hemos encontrado ningun usuario con tu cuenta!');
					}
					else
					{
						$scope.GuardarParticipante(data[0],false,Advertising,provider,localStorage["IdFacebook"]);
					}
				})
				.error(function(data, status, headers, config) {
				    var algo = data;
				});
    			break;
    	}
	}
});
