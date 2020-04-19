import { Component } from '@angular/core';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

import { NavController } from 'ionic-angular';

import { AlertController, ToastController } from '@ionic/angular';
import { error } from 'util';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  pariredList: pairedList;
  listToggle: boolean = false;
  paireDeviceID: number = 0;
  dataSend: string = "";

  public navCtrl: NavController;
  
  

  constructor(private bluetoothSerial: BluetoothSerial, public alertCtrl: AlertController,public toastCtrl: ToastController) {
      this.checkBluetoothEnable();

      
  }

    

    checkBluetoothEnable(){
      this.bluetoothSerial.isEnabled().then(
        success => {
          this.listPairedDevices();
          
        }, error => {
          this.showError("Please Enable Bluetooth");
        }
      );
    }

    listPairedDevices(){
      this.bluetoothSerial.list().then(success => {
        this.pariredList = success;
        console.log("List", this.pariredList);
        this.listToggle = true;
      }, error => {
        this.showError("Please Enable Bluetooth");
        this.listToggle = false;
      })
    }

    selectDevice(){
      let connectedDevice = this.pariredList[this.paireDeviceID];
      if(!connectedDevice.address) {
        this.showError("Select Paired Device to connect");
        return;
      }
      let address = connectedDevice.address;
      console.log("Connected Device: ", address);
      let name = connectedDevice.name;
      console.log("Connected device name: ", name);

      this.connect(address);
    }

    connect(address: string){
      this.bluetoothSerial.connect(address).subscribe(success => {
        this.deviceConnected();
        this.showToast("Successfully Connected");
        console.log("Device connected: ", address);
      }, error => {
        this.showError("Error: Connecting to device");
        console.log("Error connecting device: ", error);
      });
    }

    deviceConnected(){
      this.bluetoothSerial.subscribe('\n').subscribe(success => {
        this.handleData(success);
        this.showToast("Connected Successfully");
        console.log("Data Showing: ", this.dataSend);
      }, error => {
        this.showError(error);
        console.log("Error showing data: ", error);
      });
    }

    

    deviceDisconnected(){
      this.bluetoothSerial.disconnect();
      this.showToast("Device Disconnected");
    }

    handleData(data: any){
      this.showToast(data);
      console.log("Getting data: ", data);
    }

    sendData(){
      this.dataSend+='\n';
      this.showToast(this.dataSend);

      this.bluetoothSerial.write(this.dataSend).then(success => {
        this.showToast(success);
        console.log("Writing data: ", this.dataSend);
      }, error => {
        this.showError(error);
        console.log("Error writing data: ", error);
      });
    }

    async showError(error: string){
      const alert = await this.alertCtrl.create({
        header: "Error",
        message: error,
        buttons: ['Dismiss']
      });
      alert.present();
    }

    async showToast(msj: string){
      const toast = await this.toastCtrl.create({
        message: msj,
        duration: 2000
      });

      toast.present();
    }
}

interface pairedList {
  "class": number,
  "id": string,
  "address": string,
  "name": string
}
