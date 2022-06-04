console.log("main.js!!");

const SS_GOOGLE = "https://docs.google.com/spreadsheets/d/";
const SS_ID     = "1CzccPnNKqIEgTPyvq83w28H0t5ycmuhe_EBarAdy4xY";
const SS_CSV    = "/export?format=csv";
const SS_URL    = SS_GOOGLE + SS_ID + SS_CSV;

// 1, Vue.jsで扱うデータを用意する
const myData = {
	answerFlg: false,
	quiz: null,
	quizIndex: 0,
	quizScore: 0,
	quizes: [],
	piyoImg: "",
	piyoMsg: "",
	cntOK: 0,
	cntNG: 0
}

// 2, Vue.jsの準備をする
const app = Vue.createApp({
	data(){
		return myData;// 扱うデータを指定する
	},
	created(){
		console.log("created!!");
		this.init();// リセット
	},
	methods:{
		init(){
			// リセット
			this.answerFlg = false;
			this.quiz      = null;
			this.quizIndex = 0;
			this.quizScore = 0;
			this.quizes    = [];
			this.piyoImg   = "./images/piyo_quiz.png";
			this.piyoMsg   = "クイズに答えられるかな!?";
			this.cntOK     = 0;
			this.cntNG     = 0;
		},
		loadQuiz(){
			// クイズ全体を読み込む
			this.piyoImg = "./images/piyo_pc.png";
			this.piyoMsg = "ちょっと待ってね";
			// SpreadSheet
			loadSpreadSheet(SS_URL, arr=>{
				console.log(arr);
				this.quizes = arr;// JSONファイルからロード
				for(let quiz of this.quizes) {
					quiz.answer = quiz.btnA;// 答えを確定
					quiz.btns = [quiz.btnA, quiz.btnB, quiz.btnC, quiz.btnD];// 配列にする
				}
				this.shuffleQuiz();// クイズをシャッフル
				this.readQuiz();// クイズを1つ読み込む
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
			console.log("loadQuiz:", this.quizIndex);
			if(this.quizes.length-1 < this.quizIndex){
				console.log("Game Over!!");
				this.piyoImg = "./images/piyo_pc.png";// Piyo
				return;
			}
			// 次のクイズを読み込む
			this.piyoImg = "./images/piyo_quiz.png";// Piyo
			this.piyoMsg = "あと" + (this.quizes.length - this.quizIndex) + "問だよ";
			this.quiz = this.quizes[this.quizIndex];
			// ボタンをシャッフル
			for(let i=this.quiz.btns.length-1; 0<=i; i--){
				const rdm = Math.floor(Math.random() * i);
				const tmp = this.quiz.btns[rdm];
				this.quiz.btns[rdm] = this.quiz.btns[i];
				this.quiz.btns[i] = tmp;
			}
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
			}else{
				this.piyoImg = "./images/piyo_ng.png";// NG
				this.piyoMsg = "はずれ!!";
				this.cntNG++;
			}
			this.quizScore = Math.floor(this.cntOK / (this.cntOK + this.cntNG) * 100);// スコア
		},
		clickNext(){
			// 次の問題へ
			console.log("clickNext");
			this.answerFlg = false;// 答えを非表示に
			this.quizIndex++;// 次の問題へ
			this.readQuiz();// クイズを1つ読み込む
		},
		clickReset(){
			// リセット
			console.log("clickReset");
			this.init();// リセット
		}
	}
});
app.mount("#app");// 3, Vue.jsを起動する