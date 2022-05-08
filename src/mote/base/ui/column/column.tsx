import { createElement } from "mote/base/jsx/createElement";
import { CSSProperties } from "mote/base/jsx/style";

interface ColumnProps {
    isMobile?: boolean;
    left?: any;
    icon?: any;
    right?: any;
    children?: any;
    onMouseMove?: any;
    onMouseLeave?: any;
    style?: CSSProperties;
}


export default function Column(props: ColumnProps) {

    const getStyle = () => {
        const style = Object.assign({}, styles.column_wrapStyle) as CSSProperties;
        if (props.style?.paddingLeft && "number" == typeof(props.style.paddingLeft)) {
            style.paddingLeft = props.style.paddingLeft;
        }
        return Object.assign({}, style, props.style);
    }

    const getLeftStyle = ()=>{
        return {
            flexShrink: 0,
            flexGrow: 0,
            borderRadius: 3,
            //color: themedStyles.mediumTextColor,
            width: props.isMobile ? 26 : 22,
            height: props.isMobile ? 24 : 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: props.icon ? 0 : 8
        }
    }
    const getIconStyle = ()=>{
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            flexGrow: 0,
            width: props.isMobile ? 28 : 22,
            height: props.isMobile ? 24 : 18,
            marginRight: 4
        }
    }
    const getRightStyle = ()=>{
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            flexGrow: 0,
            height: "100%"
        }
    }

    const childrenStyle = () => {
        return {
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: "auto",
            whiteSpace: "nowrap" as any,
            minWidth: 0
        }
    }

    const renderChildren = () => {
        return (
            <div style={Object.assign({}, childrenStyle())}>
                {props.children}
            </div>
        )
    }

    return (
        <div style={getStyle()} onMouseMove={props.onMouseMove} onMouseLeave={props.onMouseLeave}>
            {props.left && <div style={getLeftStyle()}>{props.left}</div>}
            {props.icon && <div style={getIconStyle()}>{props.icon}</div>}
            {renderChildren()}
            {props.right && <div style={getRightStyle()}>{props.right}</div>}
        </div>
    )
}

const styles = {
    column_wrapStyle: {
        display: "flex",
        alignItems: "center",
        minHeight: 27,
        fontSize: 14,
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 14,
        paddingRight: 14,
        width: "100%"
    }
}