import EventEmitter from 'events';
import { BladeApi, Pane } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';
import { AppSettingsProps } from '@/interfaces/app-setting-props';
import { SerialPortProps, SerialStatus } from '@/interfaces/serial-config-props';
import { SerialGui } from './serial-gui';
import { ElectronGui } from './electron-gui';


class ApplicationGui extends EventEmitter {
	#pane: Pane;
	#settings: AppSettingsProps;
	#fpsGraph: EssentialsPlugin.FpsGraphBladeApi;
	#electronGui: ElectronGui;
	#serialGui: SerialGui;
	#timeoutId: number = -1;

	constructor() {
		super();
	}

	async setup() {
		this.#settings = await global.ipcRenderer.invoke('GetAppSettings') as AppSettingsProps;
		this.#pane = new Pane({ title: 'Settings' });
		this.#pane.registerPlugin(EssentialsPlugin);
		this.#pane.element.parentElement.style.zIndex = '1000';

		this.#createBaseConfig();
		this.#createElectronConfig();
		this.#createSerialConfig();
	}

	#createBaseConfig = () => {
		// FPS
		this.#fpsGraph = this.#pane.addBlade({
			view: 'fpsgraph',
			label: 'FPS',
			rows: 2,
		}) as EssentialsPlugin.FpsGraphBladeApi;

		// IP設定
		this.#pane.addBinding(this.#settings, 'ip', { label: 'IP' });
	};

	/**
	 * Electron設定
	 */
	#createElectronConfig = () => {
		const folder = this.#pane.addFolder({ title: 'Electron Config' });
		this.#electronGui = new ElectronGui(folder, { ...this.#settings });
		this.#electronGui.on(ElectronGui.Restart, this.#onRestartClick);
		this.#electronGui.on(ElectronGui.Change, this.#onChangeSettings);
	};

	/**
	 * シリアル通信設定
	 */
	#createSerialConfig = () => {
		const folder = this.#pane.addFolder({ title: 'Serial Config' });
		const serialPort = this.#settings.options.serialPort;
		this.#serialGui = new SerialGui(folder, serialPort);
		this.#serialGui.on(SerialGui.Change, this.#onChangeSettings);
	};

	/**
	 * 値の変更を検知して設定を保存
	 */
	#onChangeSettings = () => {
		// NOTE: 100ms間隔で保存
		window.clearTimeout(this.#timeoutId);
		this.#timeoutId = window.setTimeout(() => {
			// NOTE: Electron側の制御でPCのローカルに保存
			global.ipcRenderer.invoke('SetAppConfig', this.#getUpdateConfig());
		}, 100);
	};

	/**
	 * 設定反映のための再起動
	 */
	#onRestartClick = () => {
		global.ipcRenderer.invoke('RestartApplication', this.#getUpdateConfig());
	};

	/**
	 * 設定情報最新取得
	 */
	#getUpdateConfig = (): AppSettingsProps => {
		return {
			...this.#electronGui.config,
			options: {
				serialPort: this.#serialGui.config,
			}
		};
	};

	/**
	 * FPS計測開始
	 */
	fpsBegin = () => {
		this.#fpsGraph.begin();
	};

	/**
	 * FPS計測終了
	 */
	fpsEnd = () => {
		this.#fpsGraph.end();
	};
};

export const appGui = new ApplicationGui();