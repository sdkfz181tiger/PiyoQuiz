console.log("main.js!!");

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
        let obj = new Object();
        for(let j=0; j<keys.length; j++){
            obj[keys[j]] = items[j];
        }
        json.push(obj);
    }
    return json;
}