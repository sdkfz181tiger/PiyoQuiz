console.log("utility.js!!");

//==========
// SpreadSheet

function loadSpreadSheet(path, onLoad, onError){
	// Axios
	const option = {responseType: "blob"};
	axios.get(path, option).then(res=>{
		res.data.text().then(str=>{
			onLoad(csv2json(str));// CSV -> JSON
		});
	}).catch(err=>{
		onError(err);
	});
}

function csv2json(csv){
	const json = [];
	const lines = csv.split("\r\n");
	const keys = lines[0].split(",");
	for(let i=1; i<lines.length; i++){
		const items = lines[i].split(",");
		const obj = new Object();
		for(let j=0; j<keys.length; j++){
			obj[keys[j]] = items[j];
		}
		json.push(obj);
	}
	return json;
}

//==========
// LocalStorage

function initStorage(){
	console.log("initStorage");
	const json = localStorage.getItem("report");
	if(!json) localStorage.setItem("report", JSON.stringify({}));
}

function loadStorage(quizes){
	console.log("loadStorage");
	const json = localStorage.getItem("report");
	if(!json) return;
	const obj = JSON.parse(json);
	for(let quiz of quizes){
		if(!obj[quiz.key]){
			quiz["ok"] = 0;
			quiz["ng"] = 0;
			continue;
		}
		quiz["ok"] = obj[quiz.key]["ok"];
		quiz["ng"] = obj[quiz.key]["ng"];
	}
}

function saveStorage(key, flg){
	console.log("saveStorage:", key, flg);
	const json = localStorage.getItem("report");
	if(!json) return;
	const obj = JSON.parse(json);
	if(!obj[key]) obj[key] = {"ok": 0, "ng": 0};
	if(flg){
		obj[key]["ok"]++;
	}else{
		obj[key]["ng"]++;
	}
	localStorage.setItem("report", JSON.stringify(obj));
}