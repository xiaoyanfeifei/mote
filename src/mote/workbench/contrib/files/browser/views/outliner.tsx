import { createElement } from "mote/base/jsx/createElement";
import { Fragment } from "mote/base/jsx/jsx";
import Column from "mote/base/ui/column/column";
import fonts from "mote/base/ui/fonts";

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
  
   return (
       <Column>
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