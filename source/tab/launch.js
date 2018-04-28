import { el, mount, setStyle } from "redom";
import { CLEAR_STYLES, findBestZIndexInContainer } from "./styles.js";
import { DIALOG_TYPE_ENTRY_PICKER, toggleInputDialog } from "./inputDialog.js";
import { onBodyWidthResize } from "./resize.js";
import { getExtensionURL } from "../shared/library/extension.js";
import { itemIsIgnored } from "./disable.js";

const BUTTON_BACKGROUND_IMAGE = getExtensionURL(require("../../resources/content-button-background.png"));

export function attachLaunchButton(input) {
    if (input.dataset.bcup === "attached" || itemIsIgnored(input)) {
        return;
    }
    const { height: rawHeight, width: rawWidth, zIndex: zIndexRaw, backgroundColor } = window.getComputedStyle(
        input,
        null
    );
    const tryToAttach = () => {
        const bounds = input.getBoundingClientRect();
        const { width, height } = bounds;
        // Flag has having been attached
        input.dataset.bcup = "attached";
        // Check if we can continue
        if (width <= 0 || !input.offsetParent) {
            setTimeout(tryToAttach, 250);
            return;
        }
        const buttonWidth = 0.8 * height;
        const newInputWidth = width - buttonWidth;
        let left = input.offsetLeft + newInputWidth;
        let top = input.offsetTop;
        const buttonZ = findBestZIndexInContainer(input.offsetParent);
        // Update input style
        setStyle(input, {
            width: `${newInputWidth}px`
        });
        // Create and add button
        const button = el("button", {
            type: "button",
            tabIndex: -1,
            style: {
                ...CLEAR_STYLES,
                position: "absolute",
                width: `${buttonWidth}px`,
                height: `${height}px`,
                left: `${left}px`,
                top: `${top}px`,
                borderRadius: "0px",
                background: `rgb(0, 183, 172) url(${BUTTON_BACKGROUND_IMAGE})`,
                backgroundSize: `${buttonWidth / 2}px`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "50% 50%",
                border: "1px solid rgb(0, 155, 145)",
                cursor: "pointer",
                zIndex: buttonZ,
                outline: "none"
            }
        });
        button.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            toggleInputDialog(input, DIALOG_TYPE_ENTRY_PICKER);
        };
        mount(input.offsetParent, button);
        const reprocessButton = () => {
            try {
                left = input.offsetLeft + newInputWidth;
                top = input.offsetTop;
                setStyle(button, {
                    top: `${top}px`,
                    left: `${left}px`
                });
            } catch (err) {
                clearInterval(reprocessInterval);
                removeOnBodyWidthResize();
            }
        };
        const { remove: removeOnBodyWidthResize } = onBodyWidthResize(reprocessButton);
        const reprocessInterval = setInterval(reprocessButton, 1250);
        reprocessButton();
    };
    tryToAttach();
}
