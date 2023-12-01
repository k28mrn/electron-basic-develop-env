import p5 from "p5";
import { appGui } from "@/modules/gui/app-gui";
import { sendOsc } from "@/lib/send-osc";
import { OscEventProps } from "@/interfaces/osc-props";

/**
 * OSC通信サンプル
 * キーボードのキーを押すとOSCメッセージを送信する
 */
export const sketch = (p: p5) => {
	/**
	 * 初期設定
	 */
	p.setup = () => {
		// NOTE:
		// 作成した「addOscMessage」メソッドをOSCのメッセージを受信持に呼び出すように登録
		appGui.addOscMessage(onOscMessage);

		p.createCanvas(p.windowWidth, p.windowHeight);
		p.background(255);
	};

	/**
	 * OSCメッセージ受信時の処理
	 */
	const onOscMessage = (message: OscEventProps) => {
		console.log(message);
	};

	/**
	 * 描画処理
	 */
	p.draw = () => {
		appGui.fpsBegin(); // FPSの計測開始

		appGui.fpsEnd(); // FPSの計測終了
	};

	/**
	 * キーが押されたときの処理
	 */
	p.keyPressed = () => {
		console.log(`keyPressed = ${p.keyCode}`);
		sendOsc('/keyboard', p.keyCode); // OSC送信テスト
	};

	/**
	 * 画面のリサイズ処理
	 */
	p.windowResized = () => {
		p.resizeCanvas(p.windowWidth, p.windowHeight);
	};
};