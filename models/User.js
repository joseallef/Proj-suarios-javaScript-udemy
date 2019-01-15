class User {

	// DAO =  Data Access Object

	constructor(name, gender, birth, country, email, password, photo, admin){

		// Quando usamos _ Underline subtende-se que é privado!
		// Os atributos são privados!

		this._id;
		this._name = name;
		this._gender = gender;
		this._birth = birth;
		this._country = country;
		this._email = email;
		this._password = password;
		this._photo = photo;
		this._admin = admin;
		this._register = new Date();

	}

	get id(){
		return this._id;
	}

	set id(id){
		this._id = id;
	}

	get register(){
		return this._register;
	}

	get name(){
		return this._name;
	}

	get gender(){
		return this._gender;
	}

	get birth(){
		return this._birth;

	}

	get country(){
		return this._country;
	}

	get email(){
		return this._email;
	}

	get password(){
		return this._password;
	}

	get photo(){
		return this._photo;
	}
	set photo(photo){
		this._photo = photo;
	}

	get admin(){
		return this._admin;
	}

	loadFromJSON(json){

		for(let name in json){

			switch(name){
				case '_register':

					this[name] = new Date(json[name]);

				break;

				default :
					this[name] = json[name];

			}

		}
	}

	static getUsersStorage(){

		let users = [];

		if(localStorage.getItem("users")){

			users = JSON.parse(localStorage.getItem("users"))
		}

		return users;
	}

	getNewId(){

		let usersId = parseInt(localStorage.getItem("usersId"));

		if(!usersId > 0) usersId = 0;

		console.log(usersId);
		usersId++;

		localStorage.setItem("usersId", usersId);

		return usersId;
	}

	save(){

		let users = User.getUsersStorage();

		if(this.id > 0){

			users.map(u=>{

				if(u._id == this.id){

					Object.assign(u, this);
				}

				return u;

			});

		}else{

			// O _Uderline e usado por que não tem um SET então já manipula!
			this.id = this.getNewId();

			// O método PUCH adiciona ao final do Array
			users.push(this);

		}

		// sessionStorage.setItem() Permite gravar dados na sessão
		// Se fechar o navegador deixa de existir
		// sessionStorage.setItem("users", JSON.stringify(users));

		// localStorage.setItem() Permite gravar no localStorage 
		// Dessa forma se fecha o navegador as informações ainda estará guardadas
		localStorage.setItem("users", JSON.stringify(users));


	}

	remove(){

		let users = User.getUsersStorage();

		users.forEach((userData, index)=>{

			if(this._id == userData._id){

				// Para recemover um indice do Array
				// Método splice
				users.splice(index, 1);
			}

		});

		localStorage.setItem("users", JSON.stringify(users));

	}


}