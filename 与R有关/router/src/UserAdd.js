import React, { Component } from 'react';

export default class UserAdd extends Component {
    constructor() {
        super();
        this.text = React.createRef();
    }
    submit = (e) => {
        e.preventDefault();
        console.log(this.text.current.value);
        console.log(this.props);
        this.props.history.push('/user/list');
    }
    render() {
        return (<form onSubmit={this.submit}>
            <input type="text" ref={this.text}/>
            <button type="submit">提交</button>
        </form>)
    }
}