import React, { Component } from 'react';

export default class UserDetail extends Component {
    render() {
        return (<div>
            UserDetail {this.props.match.params.id}
        </div>)
    }
}