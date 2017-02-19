import React, { Component, PropTypes } from 'react'
import Modal from 'components/Modal'
import cs from 'classnames'

import Chess from '../gobang'

const isPC = !/(iPhone|iPad|iPod|iOS|Android|SymbianOS|Windows Phone)/i.test(navigator.userAgent)

export default class Game extends Component {
	constructor(props) {
		super(props)
		this.state = {
			messages: []
		}
		this.onKeyboard = this.onKeyboard.bind(this)
	}
	componentDidMount() {
		let size = isPC ? this.chessboard.offsetHeight : this.chessboard.offsetWidth
		this.chessboard.style.cssText = `width: ${size}px; height: ${size}px;`
		new Chess(this.canvas, {
			size
		})

		document.addEventListener('keydown', this.onKeyboard)
	}
	componentWillUnmount() {
		document.removeEventListener('keydown', this.onKeyboard)
	}
	/*  回车快速 发送消息  */
	onKeyboard() {
		var code = event.keyCode
		if (code === 13) {
			this.props.socket.emit('Message', `【${this.props.room_data[this.props.role].name}】${this.msg.value}`, 'print')
			this.msg.value = ''
		}
	}
	/*  打印消息  */
	printMsg(msg, type) {
		this.setState({
			messages: [...this.state.messages, {
				type,
				msg
			}]
		})
	}
	/*  切换准备状态  */
	toggleReady() {
		this.props.socket.emit('Ready')
	}
	/*  根据准备状态返回字  */
	getReadyWord(isReady, isSelf) {
		if (isReady) {
			return isSelf ? '取消准备' : '已准备' 
		}
		else {
			return isSelf ? '点击准备' : '未准备' 
		}
	}
	/*  格式化时间  */
	formatTime(number) {
		let minute = number / 60
		let second = number % 60
		return `${(minute < 10 ? '0' : '') + minute}:${(second < 10 ? '0' : '') + second}`
	}
	setPlayer(obj, role) {
		let isSelf = this.props.role === role
		let btnClass = cs('ready-status', {
			'ready-btn': isSelf,
			'is-ready': obj && obj.ready
		})
		let player = obj ? (
		<div className="gobang-player-group">
			<div className="gobang-player">
				<img className="avatar" src={ obj.avatar } />
				<div className="user-info">
					<div className="name">{ obj.name }</div>
					{
						obj.gameData ? (
							<p className="user-game-data">
								游戏次数：{ obj.gameData.count }<br />
								胜率：{ obj.gameData.winRate }
							</p>
						) : (
							<small className="user-game-data">暂无比赛记录</small>
						)
					}
				</div>
			</div>
			<div className="gobang-panel">
				<div className="gobang-panel-item">
					<span>阵营：</span>
					{ obj.isBlack === undefined ? '随机' : (obj.isBlack ? '黑旗' : '白棋') }
				</div>
				<div className="gobang-panel-item">
					<span>剩余时间：</span>
					{ this.formatTime(obj.time) }
				</div>
				<div className="gobang-panel-item">
					<span>得分：</span>
					{ obj.win_number }
				</div>
			</div>
			<div className={btnClass} onClick={() => isSelf && this.toggleReady()}>{ this.getReadyWord(obj.ready, isSelf) }</div>
		</div>
		) : (
		<div className="gobang-player-group">
			<div className="gobang-player">
				<div className="avatar placeholder">
					<i className="iconfont icon-cat"></i>
				</div>
				<div className="name">{ role === 'owner' ? '房主跑路了' : '待加入' }</div>
			</div>
		</div>
		)
		return player
	}
	render() {
		let modalProps = {
			key: 'modal',
			ref: (ref) => this.modal = ref,
			className: 'myModal',
			role: 'confirm',
			cancelText: '不了',
			confirmText: '确定离开',
			onConfirm: () => {
				this.modal.toggle()
				this.props.leaveRoom()
			}
		}
		let { room_name, status, owner, challenger } = this.props.room_data
		return (
			<div className="gobang">
				<div className="gobang-room-info">
					<div>
						{ room_name }
						<small className={`gobang-status ${status === '等待中' ? 'waiting' : 'playing'}`}>{ status }</small>
					</div>
					<div className="leave-room-btn" onClick={() => this.modal.toggle()}>离开房间</div>
				</div>
				<div className="gobang-main">
					<div className="gobang-left">
						{ this.setPlayer(owner, 'owner') }
						{ this.setPlayer(challenger, 'challenger') }
					</div>
					<div className="gobang-chessboard" ref={(ref) => this.chessboard = ref}>
						<canvas ref={(ref) => this.canvas = ref}></canvas>
					</div>
					<div className="gobang-control">
						<div className="gobang-messages">
							{
								Array.from(this.state.messages, (obj, i) => {
									let className = cs('gobang-msg')
									return (
										<div className={className} key={i}>{ obj.msg }</div>
									)
								})
							}
						</div>
						<input ref={(ref) => this.msg = ref} className="gobang-input" type="text" placeholder="Enter 发送消息" />
					</div>
				</div>

				<Modal {...modalProps}>
					<p>
						确定离开房间吗？<br />
						<small>（比赛中离开，结果判定为失败）</small>
					</p>
				</Modal>
			</div>
		)
	}
}

Game.propTypes = {
	role: PropTypes.string,
	leaveRoom: PropTypes.func,
	socket: PropTypes.object,
	room_id: PropTypes.string,
	room_data: PropTypes.object
}