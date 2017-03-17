import * as React from "react";

class Card extends React.Component<{title: string}, {}> {

    render() {
        return (<div className="widget-container">
            <div className="widget-draggable-handle">
                <h4>{this.props.title}</h4>
            </div>
            <div className="widget-body">
                {this.props.children}
            </div>
        </div>)
    }
}

export default Card
