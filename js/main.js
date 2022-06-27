console.log("main.js!!");

// ServiceWorker(If you needed...)
navigator.serviceWorker.register("./pwa/service_worker.js");

const SS_GOOGLE = "https://docs.google.com/spreadsheets/d/";
const SS_ID     = "1CzccPnNKqIEgTPyvq83w28H0t5ycmuhe_EBarAdy4xY";
const SS_CSV    = "/export?format=csv";
const SS_URL    = SS_GOOGLE + SS_ID + SS_CSV;

// 1, Vue.jsで扱うデータを用意する
const myData = {
	answerFlg: null,
	quiz:      null,
	quizIndex: null,
	quizes:    null,
	lifeMax:   null,
	lifeNum:   null,
	piyoImg:   null,
	piyoMsg:   null,
	popupImg:  null,
	markBkg:   null,
	markOK:    null,
	markNG:    null,
	cntOK:     null,
	cntNG:     null,
	sndOK:     null,
	sndNG:     null,
}

// 2, Vue.jsの準備をする
const app = Vue.createApp({
	data(){
		return myData;// 扱うデータを指定する
	},
	created(){
		console.log("created!!");
		initStorage();// ストレージ
		this.init();// リセット
	},
	methods:{
		init(){
			// リセット
			this.answerFlg = false;
			this.quiz      = null;
			this.quizIndex = 0;
			this.quizes    = {};
			this.lifeMax   = 3;
			this.lifeNum   = this.lifeMax;
			this.piyoImg   = "./images/piyo_quiz.png";
			this.piyoMsg   = "クイズに答えられるかな!?";
			this.popupImg  = "./images/mark_bkg.png";
			this.markBkg   = "./images/mark_bkg.png";
			this.markOK    = "./images/mark_ok.png";
			this.markNG    = "./images/mark_ng.png";
			this.cntOK     = 0;
			this.cntNG     = 0;
			this.sndOK = new Howl({
				src: "./sounds/se_ok.mp3", 
				loop: false, volume: 1.0
			});
			this.sndNG = new Howl({
				src: "./sounds/se_ng.mp3", 
				loop: false, volume: 1.0
			});
		},
		loadQuiz(){
			// クイズ全体を読み込む
			this.piyoImg = "./images/piyo_pc_wink.png";
			this.piyoMsg = "ちょっと待ってね";
			// SpreadSheet
			loadSpreadSheet(SS_URL, arr=>{
				this.quizes = arr;// JSONファイルからロード
				for(let quiz of this.quizes) {
					quiz.answer = quiz.btnA;// 答えを確定
					quiz.btns = [quiz.btnA, quiz.btnB, quiz.btnC, quiz.btnD];// 配列にする
				}
				this.shuffleQuiz();// クイズをシャッフル
				this.readQuiz();// クイズを1つ読み込む
				this.loadReport();// Report
			}, err=>{
				console.log(err);
			});
		},
		shuffleQuiz(){
			// クイズをシャッフル
			for(let i=this.quizes.length-1; 0<=i; i--){
				const rdm = Math.floor(Math.random() * i);
				const tmp = this.quizes[rdm];
				this.quizes[rdm] = this.quizes[i];
				this.quizes[i] = tmp;
			}
		},
		readQuiz(){
			// 終了判定
			console.log("readQuiz:", this.quizIndex);
			// 次のクイズを読み込む
			this.piyoImg = "./images/piyo_quiz.png";// Piyo
			this.piyoMsg = "今は" + (this.quizIndex + 1) + "問目だよ!!";
			this.quiz    = this.quizes[this.quizIndex];

			console.log(this.quiz);

			// 2択にする
			const btns   = this.quiz.btns;
			const index  = Math.floor(Math.random()*(btns.length-1)) + 1;
			for(let i=btns.length-1; 0<i; i--){
				if(i == index) continue;
				btns.splice(i, 1);
			}
			// シャッフル
			if(Math.random() < 0.5){
				const tmp = btns[0];
				btns[0] = btns[1];
				btns[1] = tmp;
			}
		},
		loadReport(){
			if(this.quizes.length <= 0) return null;
			loadStorage(this.quizes);// Load
		},
		saveReport(flg){
			if(!this.quiz) return;
			saveStorage(this.quiz.key, flg);// Save
		},
		clickStart(){
			// クイズ全体を読み込む
			console.log("clickStart");
			this.loadQuiz();
		},
		clickAnswer(btn){
			// 答えをクリック
			console.log("clickAnswer");

			if(this.answerFlg == true) return;
			this.answerFlg = true;// 答えを表示する
			if(this.quiz.answer == btn){
				this.piyoImg = "./images/piyo_ok.png";// OK
				this.piyoMsg = "あたり!!";
				this.cntOK++;
				this.lifeNum += 0;// Life
				this.saveReport(true);// OK
				this.popup(true);// Popup
			}else{
				this.piyoImg = "./images/piyo_ng.png";// NG
				this.piyoMsg = "はずれ!!";
				this.cntNG++;
				this.lifeNum -= 1;// Life
				this.saveReport(false);// NG
				this.popup(false);// Popup
			}	
		},
		clickNext(){
			// 次の問題へ
			console.log("clickNext");
			this.answerFlg = false;// 答えを非表示に
			this.quizIndex++;// 次の問題へ
			this.readQuiz();// クイズを1つ読み込む
		},
		clickResult(){
			// 結果画面へ
			console.log("clickResult");
			this.lifeNum = -1;// Life
			this.piyoImg = "./images/piyo_pc_wink.png";// Piyo
			this.loadReport();// Report
		},
		clickReset(){
			// リセット
			console.log("clickReset");
			this.init();// リセット
		},
		popup(flg){
			// GSAP
			if(flg){
				this.popupImg = "./images/mark_ok.png";
				this.sndOK.play();
				const tlPopup = gsap.timeline();
				tlPopup.to("#l-popup", {display:"block"});
				tlPopup.to("#l-popup", {duration: 0.1, ease: "power1", y: -40});
				tlPopup.to("#l-popup", {duration: 0.2, ease: "bounce", y: 0});
				tlPopup.to("#l-popup", {duration: 0.8, display:"none"});
				const tlPiyo = gsap.timeline();
				tlPiyo.to("#l-float", {duration: 0.2, ease: "power1", y: -40});
				tlPiyo.to("#l-float", {duration: 0.4, ease: "bounce", y: 0});
			}else{
				this.popupImg = "./images/mark_ng.png";
				this.sndNG.play();
				const tlPopup = gsap.timeline();
				tlPopup.to("#l-popup", {display:"block"});
				tlPopup.to("#l-popup", {duration: 0.1, ease: "power1", y: -40});
				tlPopup.to("#l-popup", {duration: 0.2, ease: "bounce", y: 0});
				tlPopup.to("#l-popup", {duration: 0.8, display:"none"});
				const tlPiyo = gsap.timeline({repeat: 1});
				tlPiyo.to("#l-float", {duration: 0.1, ease: "power1", x: -10});
				tlPiyo.to("#l-float", {duration: 0.1, ease: "power1", x: 0});
			}
		}
	}
});
app.mount("#app");// 3, Vue.jsを起動する