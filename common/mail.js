import mailer from 'nodemailer'
import smtpTransport from 'nodemailer-smtp-transport'
import async from 'async'
import config from '../config'
// import logger from './logger'

let transporter = mailer.createTransport(smtpTransport(config.mail_opts))
let SITE_ROOT_URL = `http://${config.host}`

/**
 * Send an email
 * @param {Object} data 邮件对象
 */
const sendMail = (data) => {
	if (config.debug) {
		require('opn')(`${SITE_ROOT_URL}/active_account?key=${token}&account=${account}`)
		return
	}

	async.retry({
		times: 5
	}, function(done) {
		transporter.sendMail(data, function(err, res) {
			if (err) {
				// 写为日志
				// logger.error('send mail error', err, data)
				console.log('send mail error!', err)
				return done(err)
			}
			return done()
		})
	}, function(err) {
		if (err) {
			return console.log('finally send mail error!', err)
		}
	})
}

/*  发送激活通知邮件  */
const sendActiveMail = (who, token, account) => {
	let from = config.mail_opts.auth.user
	let to = who
	let subject = config.name + '账号激活'
	let html = `<h3>你好，${account}</h3>
	<p>
    	<p>请点击下方的链接，完成账号激活ヽ(≧Д≦)ノ
    	<br/>
		<a style="margin-left: 30px; font-size: 14px; color: #3498db;" href="${SITE_ROOT_URL}/active_account?key=${token}&account=${account}">跳转到账号激活成功页面</a>
		<br/>
		如果你从来没听说过 NightCat 这个网站，说明有人滥用了你的邮箱，给你造成了困扰请不要找我谢谢:)</p>
	</p>
	`
	
	sendMail({
		from: from,
		to: to,
		subject: subject,
		html: html
	})
}

export default {
	sendMail,
	sendActiveMail,
}