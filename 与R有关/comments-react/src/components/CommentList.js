import React, { Component } from 'react';
import Comment from './Comment';
import PropTypes from 'prop-types';

export default class CommentList extends Component {
    static propTypes = {
        comments: PropTypes.array,
        onDeleteComment: PropTypes.func
    }

    static defaultProps = {
        comments: []
    }

    handleDelete = (index) => {
        const { onDeleteComment } = this.props;
        if (onDeleteComment) {
            onDeleteComment(index);
        }
    }

    render() {
        
        return (
            <div>
                {this.props.comments.map((comment, i) => 
                    <Comment
                        comment={comment}
                        key={i}
                        index={i}
                        onDeleteComment={this.handleDelete}/>
                )}
            </div>
        );
    }
};