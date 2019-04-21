import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CommentInput from '../components/CommentInput';
import { addComment } from '../reducers/comment';

class CommentInputContainer extends Component {
    static propTypes = {
        comments: PropTypes.array,
        onSubmit: PropTypes.func
    }
    constructor() {
        super();
        this.state = { username: '' };
    }

    _loadUsername = () => {
        const username = localStorage.getItem('username');
        username && this.setState({ username });
    }

    _saveUsername = (value) => {
        localStorage.setItem('username', value);
    }

    handleSubmit = (comment) => {
        // 验证评论
        if (!comment) return;
        if (!comment.username) alert('请输入用户名');
        if (!comment.content) alert('请输入内容');

        const { comments, onSubmit } = this.props;
        const newComments = [...comments, comment];
        localStorage.setItem('comments', JSON.stringify(newComments));

        // onSubmit是 connect 传进来的
        // 会dispatch一个 action 去增加评论
        onSubmit && onSubmit(comment);
    }

    componentWillMount() {
        this._loadUsername();
    }

    render() {
        return (
            <CommentInput
                username={this.state.username}
                onUserNameInputBlur={this._saveUsername} 
                onSubmit={this.handleSubmit} />
        );
    }
};

const mapStateToProps = (state) => {
    return {
        comments: state.comments
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onSubmit: (comment) => {
            dispatch(addComment(comment));
        }
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CommentInputContainer);