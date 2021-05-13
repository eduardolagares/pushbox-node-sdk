
import axios from "axios";

const PUSHBOX_PROVIDER_IDENTIFIER = 'PUSHBOX_PROVIDER_IDENTIFIER'
const PUSHBOX_DEVICE_ID = 'PUSHBOX_DEVICE_ID'
const PUSHBOX_DEVICE_API_KEY = 'PUSHBOX_DEVICE_API_KEY'
const PUSHBOX_EXTERNAL_IDENTIFIER = 'PUSHBOX_EXTERNAL_IDENTIFIER'
const PUSHBOX_EXTRA_DATA = 'PUSHBOX_EXTRA_DATA'
const PUSHBOX_DEVICE_TAGS = 'PUSHBOX_DEVICE_TAGS'
const PUSHBOX_PROVIDER_LABEL = 'PUSHBOX_PROVIDER_LABEL'
const PUSHBOX_SYSTEM_LABEL = 'PUSHBOX_SYSTEM_LABEL'
const PUSHBOX_API_HOST = 'PUSHBOX_API_HOST'
const PUSHBOX_API_KEY = 'PUSHBOX_API_KEY'
const PUSHBOX_BADGE_NUMBER = 'PUSHBOX_BADGE_NUMBER'

class PushboxClient {
    static async init(params) {
        if(!params.storage) {
            throw 'You have to set storage for PushboxClient';
        }

        console.log('PushboxClient storage', params.storage)

        this.storage = params.storage;

        await this.setProviderLabel(params.provider_label);
        await this.setSystemLabel(params.system_label);
        await this.setApiHost(params.api_host);
        await this.setApiKey(params.api_key);
    }

    storage = null
    
    // GETTERS AND SETTERS
    // PUSHBOX_API_KEY
    static async setApiKey(value) {
        return await this.setValue(PUSHBOX_API_KEY, value)
    }

    static async getApiKey() {
        return await this.getValue(PUSHBOX_API_KEY)
    }

    // PUSHBOX_API_HOST
    static async setApiHost(value) {
        return await this.setValue(PUSHBOX_API_HOST, value)
    }

    static async getApiHost() {
        return await this.getValue(PUSHBOX_API_HOST)
    }

    // PUSHBOX_SYSTEM_LABEL
    static async setSystemLabel(value) {
        return await this.setValue(PUSHBOX_SYSTEM_LABEL, value)
    }

    static async getSystemLabel() {
        return await this.getValue(PUSHBOX_SYSTEM_LABEL)
    }

    // PUSHBOX_PROVIDER_IDENTIFIER
    static async setProviderIdentifier(value) {
        return await this.setValue(PUSHBOX_PROVIDER_IDENTIFIER, value)
    }

    static async getProviderIdentifier() {
        return await this.getValue(PUSHBOX_PROVIDER_IDENTIFIER)
    }

    // PUSHBOX_DEVICE_API_KEY
    static async setDeviceApiKey(value) {
        return await this.setValue(PUSHBOX_DEVICE_API_KEY, value)
    }

    static async getDeviceApiKey() {
        return await this.getValue(PUSHBOX_DEVICE_API_KEY)
    }

    // PUSHBOX_PROVIDER_LABEL
    static async setProviderLabel(value) {
        return await this.setValue(PUSHBOX_PROVIDER_LABEL, value)
    }

    static async getProviderLabel() {
        return await this.getValue(PUSHBOX_PROVIDER_LABEL)
    }

    // PUSHBOX_DEVICE_ID
    static async setDeviceId(value) {
        return await this.setValue(PUSHBOX_DEVICE_ID, value)
    }

    static async getDeviceId() {
        return await this.getValue(PUSHBOX_DEVICE_ID);
    }

    // PUSHBOX_EXTERNAL_IDENTIFIER
    static async setExternalIdentifier(value) {
        return await this.setValue(PUSHBOX_EXTERNAL_IDENTIFIER, value)
    }

    static async getExternalidentifier() {
        return await this.getValue(PUSHBOX_EXTERNAL_IDENTIFIER);
    }

     // PUSHBOX_BADGE_NUMBER
     static async setBadgeNumber(value) {
        return await this.setValue(PUSHBOX_BADGE_NUMBER, value);
    }

    static async getBadgeNumber() {
        return await this.getValue(PUSHBOX_BADGE_NUMBER);
    }

    // PUSHBOX_EXTRA_DATA
    static async setExtraData(value) {
        return await this.setValue(PUSHBOX_EXTRA_DATA, JSON.stringify(value))
    }

    static getExtraData() {
        let result = {}
        try {
            JSON.parse(this.getValue(PUSHBOX_EXTRA_DATA));
        }
        catch(e) {
            // reuslt = {};
        }
        return result;
    }

    // PUSHBOX_DEVICE_TAGS
    static async setDeviceTags(value) {
        return await this.setValue(PUSHBOX_DEVICE_TAGS, JSON.stringify(value))
    }

    static async getDeviceTags() {
        let result = [];
        try {
            const currentTags = await this.getValue(PUSHBOX_DEVICE_TAGS);
            result = JSON.parse(currentTags);
        }
        catch(e) {
            console.error(e);
        }
       return result;
    }

    // API
    static async sync() {
        try {
            const currentDeviceId = await this.getDeviceId();
            const data = await this.paramsObject();
            let syncResponse = null;
            const axiosInstance = await this.buildAxios();
            if(currentDeviceId == null) {
                syncResponse = await axiosInstance.post(`${await this.getApiHost()}/api/v1/devices`, data).then(response => response.data);
            }
            else {
                syncResponse = await axiosInstance.put(`${await this.getApiHost()}/api/v1/devices/${currentDeviceId}`, data).then(response => response.data);
            }

            await this.setDeviceApiKey(syncResponse.api_key.toString());
            await this.setDeviceId(syncResponse.id.toString());
        
            return syncResponse;
        }
        catch(e) {
            console.error('sync error', e, e.data);
            return null;
        }
    }

    static async subscribe(topicId) {
        const deviceId = await this.getDeviceId();
        if(deviceId === null) {
            throw 'Register this device before list subscriptions.';
        }
        const axiosInstance = await this.buildAxios();
        
        return axiosInstance.post(`${await this.getApiHost()}/api/v1/devices/${deviceId}/subscriptions`, {
            topic_id: topicId
        });
    }

    static async unsubscribe(subscriptionId) {
        const deviceId = await this.getDeviceId();
        if(deviceId === null) {
            throw 'Register this device before list subscriptions.';
        }
        
        const axiosInstance = await this.buildAxios();
        return axiosInstance.delete(`${await this.getApiHost()}/api/v1/devices/${deviceId}/subscriptions/${subscriptionId}`);
    }

    static async device() {
        const deviceId = await this.getDeviceId();
        if(deviceId === null) {
            throw 'Register this device before list subscriptions.';
        }

        const axiosInstance = await this.buildAxios();
        
        return await axiosInstance.get(`${await this.getApiHost()}/api/v1/devices/${deviceId}`).then(response => response.data);
    }

    static async subscriptions() {
        const deviceId = await this.getDeviceId();
        
        if(deviceId === null) {
            throw 'Register this device before list subscriptions.';
        }

        const axiosInstance = await this.buildAxios();
        return await axiosInstance.get(`${await this.getApiHost()}/api/v1/devices/${deviceId}/subscriptions`).then(response => response.data);
    }

    static async notifications() {
        const deviceId = await this.getDeviceId();
        
        if(deviceId === null) {
            throw 'Register this device before list notifications.';
        }

        const axiosInstance = await this.buildAxios();
        return await axiosInstance.get(`${await this.getApiHost()}/api/v1/devices/${deviceId}/notifications`).then(response => response.data);
    }

    static async setNotificationAsRead(notificationId) {
        const deviceId = await this.getDeviceId();
        
        if(deviceId === null) {
            throw 'Register this device before list notifications.';
        }

        const axiosInstance = await this.buildAxios();
        return await axiosInstance.post(`${await this.getApiHost()}/api/v1/devices/${deviceId}/notifications/${notificationId}/read`).then(response => response.data);
    }

    static async topics(serachTerm) {
        const axiosInstance = await this.buildAxios();
        return await axiosInstance.get(`${await this.getApiHost()}/api/v1/topics`, {params: {search: serachTerm}}).then(response => response.data);
    }

    static async tags() {
        const axiosInstance = await this.buildAxios();
        return axiosInstance.get(`${await this.getApiHost()}/api/v1/tags`).then(response => response.data);
    }

    // private
    static async paramsObject() {
        const data = {
            system_label: await this.getSystemLabel(),
            provider_label: await this.getProviderLabel(),
            provider_identifier: await this.getProviderIdentifier(),
            external_identifier: await this.getExternalidentifier(),
            extra_data: await this.getExtraData(),
            tags: await this.getDeviceTags()
        }

        return data;
    }
    static async getValue(key) {
        try {
            return await this.storage.getItem(key);
          } catch (err) {
              return null
          }
    }

    static async setValue(key, value) {
        if(value == null) {
            await this.storage.removeItem(key);
        }
        else {
            await this.storage.setItem(key, value)
        }
        
    }


    static async buildAxios() {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-PushBox-Api-Key': await this.getApiKey(),
                common: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                },
                post: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                },
                put: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                },
                patch: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                }
            }
        }

        const deviceApiKey = await this.getDeviceApiKey();

        if(deviceApiKey !== null) {
            config.headers['X-PushBox-Device-Api-Key'] = deviceApiKey
        }

        return axios.create(config);
       
    }

}


export default PushboxClient;
