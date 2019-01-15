	class UserController {

		constructor(formIdCreate, formIdUpdate, tableId){
			this.formEl = document.getElementById(formIdCreate);
			this.formUpdateEl = document.getElementById(formIdUpdate);
			this.tableEl = document.getElementById(tableId);

			this.onSubmit();
			this.onEdit();
			this.selectAll();
		}

		onEdit(){

			document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{

				this.showPanelCreate();

			});

			this.formUpdateEl.addEventListener("submit", event=>{

				event.preventDefault();

				let btn = this.formUpdateEl.querySelector("[type=submit]");

				// Desabilitando o Botão 
				btn.disabled = true;

				let values = this.getValues(this.formUpdateEl);


				let index = this.formUpdateEl.dataset.trIndex;

				console.log(index);

				let tr = this.tableEl.rows[index];

				let userOld = JSON.parse(tr.dataset.user);

				// Copia o valor de atributos de um objeto 
				//Object.assign Cria um objeto destino, retornando este objeto
				let result = Object.assign({}, userOld, values);

		  		this.getPhoto(this.formUpdateEl).then((content) =>{

		  			if(!values.photo){
		  				result._photo = userOld._photo;
		  			}else{
		  				result._photo = content;
		  			}

		  			let user = new User();

		  			user.loadFromJSON(result);

		  			user.save();

		  			this.getTr(user, tr);

					// JSON.stringify() Transforma um object json em uma String
					//tr.dataset.user = JSON.stringify(result);

			  		this.updateCount();
					// Metodo Reset para limpar o formulario após ter submetido
					this.formUpdateEl.reset();

					// Abilitando o Botão
					btn.disabled = false;

					this.showPanelCreate();

					}, (e)=>{

						console.error(e);
					}
				);	

			});

		}

		onSubmit(){

			this.formEl.addEventListener("submit", event =>{

				event.preventDefault();

				let btn = this.formEl.querySelector("[type=submit]");

				// Desabilitando o Botão 
				btn.disabled = true;

				let values = this.getValues(this.formEl);

				if(!values) return false;

				this.getPhoto(this.formEl).then((content) =>{

					values.photo = content;

					values.save();

					this.addLine(values);

					// Metodo Reset para limpar o formulario após ter submetido
					this.formEl.reset();

					// Abilitando o Botão
					btn.disabled = false;

					}, (e)=>{

						console.error(e);
					}
				);				
			});

		}

		// Síncrono: quando um processamento depende um do outro ou uma aplicação depede da outra!
		// Assíncono quando aplicações ou funções são executadas paralelamente

		getPhoto(formEl){

			return new Promise((resolve, reject)=>{

				let fileReader = new FileReader();

				let elements = [...formEl.elements].filter(item => {

					if (item.name === 'photo'){
						return item;
					}

				});

				let file = elements[0].files[0];

				// Função ONLOAD executada quando o aquivo e carregado!

				fileReader.onload = () =>{

					resolve(fileReader.result);

				};
				fileReader.onerror = (e) =>{

					reject(e);
				}

				if(file){
					// Obtendo o caminho do arquivo após ter selecionado!
					fileReader.readAsDataURL(file);
				}else{
					// Por padrão se não selecionado nenhuma imagem FICA ESTÁ!
					resolve("dist/img/boxed-bg.jpg");
				}

			});
		
		}

		getValues(formEl){

			// JSON
			let user = {};

			// Operador Spread [... ] ver como um array

			let isValid = true;

			[...formEl.elements].forEach(function(key, value){

				if(['name', 'email', 'password'].indexOf(key.name) > -1 && !key.value){

					key.parentElement.classList.add('has-error');

					isValid = false;

				}

			if(key.name == "gender"){

				if(key.checked){

					user[key.name] = key.value;
				}

			}else if(key.name == "admin"){
				user[key.name] = key.checked;

			} else {
				user[key.name] = key.value;
			}

		});

		if(!isValid){

			return false;

		}


		return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo,
		 user.admin);

		}

		selectAll(){
			let users = User.getUsersStorage();

			users.forEach( dataUser=>{

				let user = new User();

				user.loadFromJSON(dataUser);

				this.addLine(user);
			});	
		}

		// Adiciona uma nova linha TR na tabela
		addLine(dataUser){

			let tr = this.getTr(dataUser);

		  	// Adciona uma nova linha quando feito um novo cadastro!
		  	// appendChild Insere no final append = adiciona, Child = filho no final 
		  	this.tableEl.appendChild(tr);

		  	this.updateCount();

		}

		// Seleciona a TR que vai gerar
		getTr(dataUser, tr = null){

			if(tr === null) tr = document.createElement("tr");

			// Serialização Transforma um Objeto em um texto!
			tr.dataset.user = JSON.stringify(dataUser);
			// JSON convertido em texto string JSON

			tr.innerHTML = `
		        <td><img src="${dataUser.photo}" class="img-circle img-sm"></td>
		        <td>${dataUser.name}</td>
		        <td>${dataUser.email}</td>
		        <td>${(dataUser.admin)? 'Sim' : "Não" }</td>
		        <td>${Utils.dateFormat(dataUser.register)}</td>
		        <td>
		          <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
		          <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
		        </td>
	  		`;

			this.addEventsTr(tr);

			return tr;
		}

		addEventsTr(tr){

			tr.querySelector(".btn-delete").addEventListener("click", e=>{

				//CONFIRM Abre uma janela de confirmação com OK e CANCELAR
				if(confirm("Deseja realmente excluir?")){

					let user = new User();

					user.loadFromJSON(JSON.parse(tr.dataset.user));

					// Chamando o método remove no User.js
					user.remove();

					//REMOVE Vai remover a linha correspondente do Array!
					// Esse e um comando ao contrario desse de cima!
					tr.remove();

					this.updateCount();

				}

			});

			tr.querySelector(".btn-edit").addEventListener("click", e=>{

	  			// Converte um Objeto JSON
	  			let json = JSON.parse(tr.dataset.user);

	  			this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

	  			for(let name in json){

	  				// REPLECE e uma função nativa que substitui dados ENTÂO vai trocar
	  				let field = this.formUpdateEl.querySelector("[name="+name.replace("_", "")+ "]");

	  				if(field){
		  				// O CONTINUE Ignora o restante das instruções e avança
		  				//if(field.type == 'file') continue;

		  				switch(field.type){
		  					case 'file':
		  						continue;
		  					break;

		  					case 'radio':
		  						field = this.formUpdateEl.querySelector("[name="+name.replace("_", "")+"][value="+json[name]+"]");
		  						field.checked = true;
		  					break;

		  					case 'checkbox':
		  						field.checked = json[name];
		  					break;

		  					default: 
		  						// Vai passar por cada vez dentro do laço
		  						field.value = json[name];			  				

		  				}
		  				
	  				}
	  			}

	  			this.formUpdateEl.querySelector(".photo").src = json._photo;

	  			this.showPanelUpdate();

  			});

		}

		showPanelCreate(){
  			document.querySelector("#box-user-create").style.display = "block";
  			document.querySelector("#box-user-update").style.display = "none";
  		}

  		showPanelUpdate(){
  			document.querySelector("#box-user-create").style.display = "none";
  			document.querySelector("#box-user-update").style.display = "block";
  		}	

		updateCount(){

			let numberUsers = 0;
			let numberAdmin = 0;

			[...this.tableEl.children].forEach(tr=>{

				numberUsers++;

				// O elemento DATASET permite o acesso em modo de leitura e escrita!
				let user = JSON.parse(tr.dataset.user);


				// Quando usado _Underline no admin chama a propriedade admin
				if(user._admin) numberAdmin++;
			});

			document.querySelector("#number-users").innerHTML = numberUsers;
			document.querySelector("#number-users-admin").innerHTML = numberAdmin;
		}

}