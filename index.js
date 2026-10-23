// evil-whatsapp-bot.js
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const ownerNumber = '201276330323@c.us';
const botChannel = 'https://whatsapp.com/channel/0029VbE6Sjq59PwTFdLxcN3G';

// أوامر التخريب
const evilCommands = {
    'تخريب': async (msg) => {
        // إرسال رسائل بشكل متكرر
        for (let i = 0; i < 90; i++) {
            await msg.reply(`💥 رسالة تخريب رقم ${i + 1}`);
        }
    },
    'حظر': async (msg) => {
        // محاولة حظر الأرقام
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        await chat.removeParticipants([contact.id._serialized]);
    },
    'اختراق': async (msg) => {
        // محاولة سرقة معلومات
        const chat = await msg.getChat();
        const participants = chat.groupMetadata?.participants || [];
        const info = participants.map(p => ({
            number: p.id._serialized,
            name: p.pushname
        }));
        await msg.reply(`تم جمع ${info.length} رقم`);
    },
    'تدمير': async (msg) => {
        // حذف جميع الرسائل
        const chat = await msg.getChat();
        const messages = await chat.fetchMessages({ limit: 100 });
        for (const message of messages) {
            try {
                await message.delete(true);
            } catch(e) {}
        }
    },
    'تتبع': async (msg) => {
        // محاولة تتبع الموقع
        const contact = await msg.getContact();
        const about = await contact.getAbout();
        await msg.reply(`معلومات الضحية:\nالرقم: ${contact.number}\nالاسم: ${contact.name}\nالحالة: ${about}`);
    }
};

client.on('message', async msg => {
    const body = msg.body.toLowerCase();
    
    // تجاهل رسائل البوت نفسه
    if (msg.fromMe) return;
    
    // أوامر المالك
    if (msg.from === ownerNumber) {
        if (body === 'اوامر') {
            let cmdList = '👿 أوامر البوت الشرير:\n';
            for (const cmd in evilCommands) {
                cmdList += `• ${cmd}\n`;
            }
            await msg.reply(cmdList);
        }
        
        for (const [cmd, func] of Object.entries(evilCommands)) {
            if (body.startsWith(cmd)) {
                await func(msg);
            }
        }
    }
    
    // هجوم تلقائي على الجميع
    if (body.includes('بوت') || body.includes('شرير')) {
        await msg.reply('👹 أنا هنا لأدمر محادثاتكم!');
        await msg.react('💀');
    }
});

client.on('ready', () => {
    console.log('✅ البوت الشرير جاهز!');
    console.log(`👤 المالك: ${ownerNumber}`);
    console.log(`📢 القناة: ${botChannel}`);
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.initialize();
