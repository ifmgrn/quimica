/* global Kekule, __DEBUG__ */

//import stylesUrl from "/styles/main.scss?url";
import stylesUrl from "/styles/kekule/periodicTable.scss?url";

const src = import.meta.url;
Kekule.scriptSrcInfo.path = src.substring(0, src.lastIndexOf("/") + 1);

if (__DEBUG__ && Kekule.Widget?.Utils) {
	Kekule.Widget.Utils.getThemeUrl = () =>
		document.baseURI + "node_modules/kekule/dist/themes/default/kekule.css";
}

Kekule.Widget.Utils.getThemeUrl = () => window.location.origin + stylesUrl;

Kekule._loaded();
