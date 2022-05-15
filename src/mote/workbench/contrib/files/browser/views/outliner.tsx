import { createElement } from "mote/base/jsx/createElement";
import { Fragment } from "mote/base/jsx/jsx";
import Column from "mote/base/ui/column/column";
import fonts from "mote/base/ui/fonts";
import SVGIcon from "mote/base/ui/svgicon/svgicon";
import { ThemedColors, ThemedStyles } from "mote/base/ui/themes";

const PlusIcon = () => {
  
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <SVGIcon name="plus" style={{
                fill: ThemedStyles.mediumIconColor.dark,
                width: 16,
                height: 16
            }}/>
        </div>
    )
}

interface ColumnNameProps {
    shouldWrap?: boolean;
    displayName?: string;
    //store: RecordStore;
    isTopLevel: boolean;
    placeholder?: string;
}

const ColumnName = (props: ColumnNameProps) => {
    

    const getStyle=()=>{
        return Object.assign({}, !props.shouldWrap && fonts.textOverflowStyle || {});
    }

    const getTitle = () => {
        const title = "";
        
        if (null != title && title.length > 0) {
            return title;
        }
        return getEmptyTitle();
    }

    const getEmptyTitle = () => {
        if (props.placeholder){
            return props.placeholder;
        } else {
            return "emptyPageTitle"
        }
    }

    return (
        <div style={getStyle()}>
            {getTitle()}
        </div>
    )
}

const PageItem = (props) => {
    
    const isMobile = false;
    const open = false;
    const focused = false;

    const shouldShowChildren = () => {
        return open;
    }

    const getPaddingLeftUnit = () => {
        return isMobile ? 22 : 14;
    }

    const getInitialPaddingLeft = () => {
        return isMobile ? 6 : 14;
    }

    const getLinkStyle = () => {
        return {
            width: "100%",
            display: "block",
            textDecoration: "none",
            color: ThemedColors.inherit
        }
    }

    const getActiveStyle = () => {
        return {
            background: ThemedStyles.buttonHoveredBackground.dark,
            color: ThemedStyles.regularTextColor.dark,
            fontWeight: fonts.fontWeight.semibold
        }
    }

    const getSidebarItemStyle = () => {
        return Object.assign({}, focused && {
            background: ThemedStyles.buttonHoveredBackground.dark,
            color: ThemedStyles.regularTextColor.dark,
        }, props.style);
    }

    const getSubOutlinerStyle = () => {
        const subOutlinerStyle = Object.assign({}, props.style);
        const sidebarItemStyle = getSidebarItemStyle();
        const paddingLeft: number = "number" == typeof(sidebarItemStyle.paddingLeft) ? sidebarItemStyle.paddingLeft as number : getInitialPaddingLeft();
        subOutlinerStyle.paddingLeft = paddingLeft + getPaddingLeftUnit();
        return subOutlinerStyle;
    }

    const getButtonStyle = () => {
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 20,
            height: 20,
            borderRadius: 3
        }
    }

    const renderIcon = () => {
        return (
            <SVGIcon name="page" style={{fill: "#ffffff"}}/>
        )
    }

    return (
        <Column
            icon={renderIcon()}>
                <ColumnName  isTopLevel/>
        </Column>
    )
}


export class Outliner {

    create(parent: HTMLElement) {
        const content = this.render();
        parent.appendChild(content);
    }

    render() {
        const pageItems = [{}, {}];
        console.log("PageItem(item)", PageItem({}));
        console.log("SVG", <SVGIcon name="page" style={{fill: "#ffffff"}}/>);

        return (
            <>
                {pageItems.map(item=>PageItem(item))}
            </>
        )
    }

    renderEmptyChildrenPlaceholder() {
        return (
            <span>Empty Children</span>
        )
    }
}

const styles = {
    outliner: {
        paddingTop: "14px",
        paddingBottom: "20px",
        zIndex: 1,
        overflow: "hidden auto",
        marginRight: "0px",
        marginBottom: "0px",
    },
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