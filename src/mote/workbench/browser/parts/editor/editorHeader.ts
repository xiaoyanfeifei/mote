import { ThemedStyles } from "mote/base/common/themes";

class EditorHeader {



    getTitleStyle() {
        return {
            color: ThemedStyles.regularTextColor.dark,
            fontWeight: 700,
            lineHeight: 1.2,
            fontSize: 40,
            cursor: "text",
            display: "flex",
            alignItems: "center"
        }
    }
}
