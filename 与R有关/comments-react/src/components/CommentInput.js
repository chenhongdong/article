import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class CommentInput extends Component {
    static propTypes = {
        username: PropTypes.any,
        onSubmit: PropTypes.func,
        onUserNameInputBlur: PropTypes.func
    }
    static defaultProps = {
        username: ''
    }
    constructor(props) {
        super(props);
        this.state = {
            username: props.username, // 从props上直接取username
            content: ''
        };
    }
    handleUsername = (event) => {
        this.setState({
            username: event.target.value
        });
    }
    handleContent = (event) => {
        this.setState({
            content: event.target.value
        });
    }
    handleSubmit = () => {
        if (this.props.onSubmit) {
            const { username, content } = this.state;
            this.props.onSubmit({
                username,
                content,
                createAt: +new Date()
            });
        }

        this.setState({ content: '' });
    }
    handleBlur = (event) => {
        this._saveUsername(event.target.value);
    }
    _saveUsername(value) {
        if (this.props.onUserNameInputBlur) {
            this.props.onUserNameInputBlur(value);
        }
    }
    _loadUsername() {
        const username = localStorage.getItem('username');
        if (username) {
            this.setState({
                username
            });
        }
    }

    // 生命周期
   
    componentDidMount() {
        this.textarea.focus();
    }

    render() {
        return (
            <div className="comment-input">
                <div className="comment-field">
                    <span className="comment-field-name">用户名：</span>
                    <div className="comment-field-input">
                        <input
                            onBlur={this.handleBlur}
                            value={this.state.username}
                            onChange={this.handleUsername} />
                    </div>
                </div>
                <div className="comment-field">
                    <span className="comment-field-name">评论内容：</span>
                    <div className="comment-field-input">
                        <textarea
                            ref={(textarea) => this.textarea = textarea}
                            value={this.state.content}
                            onChange={this.handleContent} />
                    </div>
                </div>
                <div className="comment-field-button">
                    <button onClick={this.handleSubmit}>发布</button>
                </div>
            </div>
        );
    }
};