console.log("main.js!!");

// ServiceWorker(If you needed...)
navigator.serviceWorker.register("./pwa/service_worker.js");

const SS_GOOGLE = "https://docs.google.com/spreadsheets/d/";
const SS_ID     = "1CzccPnNKqIEgTPyvq83w28H0t5ycmuhe_EBarAdy4xY";
const SS_CSV    = "/export?format=csv";
const SS_URL    = SS_GOOGLE + SS_ID + SS_CSV;

const MODE_NONE   = 0;
const MODE_TITLE  = 1;
const MODE_QUIZ   = 2;
const MODE_RESULT = 3;
const MODE_DETAIL = 4;

const myData = {
	mode:      null,
	quizes:    null,
	quiz:      null,
	quizIndex: null,
	answerFlg: null,
	lifeMax:   null,
	lifeNum:   null,
	piyoImg:   null,
	piyoMsg:   null,
	markBkg:   null,
	markOK:    null,
	markNG:    null,
	cntOK:     null,
	cntNG:     null,
	sndOK:     null,
	sndNG:     null,
}

const app = Vue.createApp({
	data(){
		return myData;
	},
	created(){
		console.log("created!!");
		initStorage();// ストレージ
		this.init();// リセット
	},
	methods:{
		init(){
			// リセット
			this.mode      = MODE_TITLE;
			this.quizes    = null;
			this.quiz      = null;
			this.quizIndex = 0;
			this.answerFlg = false;
			this.lifeMax   = 3;
			this.lifeNum   = this.lifeMax;
			this.piyoImg   = "./images/piyo_quiz.png";
			this.piyoMsg   = "ちょっと待ってね!!";
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

			// SpreadSheet
			loadSpreadSheet(SS_URL, arr=>{
				this.quizes = arr;// JSONファイルからロード
				for(let quiz of this.quizes){
					quiz.answer = quiz.btnA;// 答えを確定
					quiz.btns = [quiz.btnA, quiz.btnB, quiz.btnC, quiz.btnD];// 配列にする
				}
				this.piyoImg = "./images/piyo_ok.png";
				this.piyoMsg = "クイズに答えられるかな!?";
			}, err=>{
				console.log(err);
			});
		},
		readyQuiz(){
			// クイズを準備する
			this.shuffleQuiz();// クイズをシャッフル
			this.readQuiz();// クイズを1つ読み込む
			this.loadReport();// Report
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
			this.piyoMsg = "次は" + (this.quizIndex + 1) + "問目だよ!!";
			this.quiz    = this.quizes[this.quizIndex];
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
			const key = this.quiz.exam + this.quiz.no;// Key
			saveStorage(key, flg);// Save
		},
		clickStart(){
			// クイズ開始をクリック
			console.log("clickStart");
			if(!this.quizes) return;
			this.mode = MODE_QUIZ;// Quiz画面へ
			this.readyQuiz();
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
			if(!this.quizes) return;
			this.mode = MODE_RESULT;// 結果画面へ
			if(this.cntOK < 10){
				this.piyoImg = "./images/piyo_pc_confuse.png";// Piyo
				this.piyoMsg = "今日は調子が悪いピヨ!!";
			}else if(this.cntOK < 20){
				this.piyoImg = "./images/piyo_pc_cry.png";// Piyo
				this.piyoMsg = "もっとがんばるピヨ!!";
			}else if(this.cntOK < 40){
				this.piyoImg = "./images/piyo_pc_night.png";// Piyo
				this.piyoMsg = "まだまだやれるピヨ!!!!";
			}else{
				this.piyoImg = "./images/piyo_pc_wink.png";// Piyo
				this.piyoMsg = "とても満足ピヨ!!!!";
			}
			this.loadReport();// Report
		},
		clickRetry(){
			// リトライ
			console.log("clickReset");
			this.mode = MODE_TITLE;// タイトル画面へ
			this.init();// リセット
		},
		clickDetail(){
			// 成績確認
			console.log("clickDetail");
			this.mode = MODE_DETAIL;// 成績確認画面へ

			for(let quiz of this.quizes) {
				console.log(quiz);
			}
		},
		popup(flg){
			// GSAP
			if(flg){
				this.sndOK.play();
				const id = "#l-popup-ok";
				const tlPopup = gsap.timeline();
				tlPopup.to(id, {display:"block", opacity: 1.0});
				tlPopup.to(id, {duration: 0.1, ease: "power1", y: -20});
				tlPopup.to(id, {duration: 0.4, ease: "bounce", y: 0});
				tlPopup.to(id, {duration: 0.5, display: "none", opacity: 0.0});
				const tlPiyo = gsap.timeline();
				tlPiyo.to("#l-float", {duration: 0.2, ease: "power1", y: -40});
				tlPiyo.to("#l-float", {duration: 0.4, ease: "bounce", y: 0});
			}else{
				this.sndNG.play();
				const id = "#l-popup-ng";
				const tlPopup = gsap.timeline();
				tlPopup.to(id, {display:"block", opacity: 1.0});
				tlPopup.to(id, {duration: 0.1, ease: "power1", y: -20});
				tlPopup.to(id, {duration: 0.4, ease: "bounce", y: 0});
				tlPopup.to(id, {duration: 0.5, display: "none", opacity: 0.0});
				const tlPiyo = gsap.timeline({repeat: 1});
				tlPiyo.to("#l-float", {duration: 0.1, ease: "power1", x: -10});
				tlPiyo.to("#l-float", {duration: 0.1, ease: "power1", x: 0});
			}
		}
	}
});

// Components
app.component("cmp-pwd", {
	template: "#tmp-pwd",
	data(){
		return {
			pwdTitle: "宿題メール",
			pwdURL: "https://www.mag2.com/m/0000001414"
		}
	}
});

app.mount("#app");