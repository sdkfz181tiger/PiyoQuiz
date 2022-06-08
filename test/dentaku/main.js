console.log("main.js!!");

// 1, Vue.jsで扱うデータを用意する
const myData = {
	imgPiyo: "./images/piyo_pc_wink.png",
	display: ""
}

// 2, Vue.jsの準備をする
const app = Vue.createApp({
	data(){
		return myData;// 扱うデータを指定する
	},
	created(){
		console.log("created!!");
	},
	methods:{
		clickBtn(value){
			console.log("clickBtn:", value);

			// ディスプレイに表示する計算式
			this.display += value;

			// ひよこの画像
			if(this.display.length < 10){
				this.imgPiyo = "./images/piyo_pc_wink.png";
			}else{
				if(Math.random() < 0.5){
					this.imgPiyo = "./images/piyo_pc_cry.png";
				}else{
					this.imgPiyo = "./images/piyo_pc_confuse.png";
				}
			}
		}
	}
});
app.mount("#app");// 3, Vue.jsを起動する