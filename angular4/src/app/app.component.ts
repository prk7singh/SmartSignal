import { Component,OnChanges,DoCheck } from '@angular/core';
import { Observable } from "rxjs/Rx"
declare var $;
declare var moment;
enum orientation{
	horizontal=1,
	vertical=2
}
class Day{
	cars: number;
	constructor() {
		// code...
	}
}
class Vehicle{
	left:number;
	top:number;
	color:string;
	constructor(left,top,color) {
		this.left=left;
		this.top=top;
		this.color=color;
	}
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnChanges {
	base_Url="http://localhost:5600/";
	vHor:Vehicle[]=[new Vehicle(690,85,'red'),new Vehicle(750,85,'blue'),new Vehicle(810,85,'pink'),new Vehicle(870,85,'red'),new Vehicle(930,85,'blue'),new Vehicle(990,85,'pink')];
	vVer:Vehicle[]=[new Vehicle(260,15,'blue'),new Vehicle(320,15,'pink')];

	waitTimeHorizontal=15;
	waitTimeVertical=20
	horizonalLight=0;
	verticalLight=this.waitTimeVertical;
	lastTurn=orientation.horizontal;
	csvfiles:any[]=[];
	predictions:any[]=[];
	horizontalOb;
	verticalOb;
	horizontalSubs;
	verticalSubs;
	lightTimer;
	leftCanvas=180;
	
	requesttypedata: any[] = [new Day()];
	constructor(){
		this.initTimer();
		this.horizontalSubs=new Observable((observer) => {
			this.horizontalOb=observer;
		});
		setTimeout(()=>{
			this.moveH();
		},0);
		this.horizontalSubs.subscribe((item)=>{
			if(item==0){
				this.moveH();
			}
			
		});
		this.verticalSubs=new Observable((observer) => {
			this.verticalOb=observer;
		});
		this.verticalSubs.subscribe((item)=>{
			if(item==0){
				this.moveV();
			}
		});
		this.resetTime();
	}
	resetTime(){
		setTimeout(()=>{
			if(this.lastTurn==orientation.vertical && this.verticalLight==0){
				this.horizonalLight=this.waitTimeHorizontal;
				this.verticalLight=0;
				this.lastTurn=orientation.horizontal;
			}
			if(this.lastTurn==orientation.horizontal && this.horizonalLight==0){
				this.verticalLight=this.waitTimeVertical;
				this.horizonalLight=0;
				this.lastTurn=orientation.vertical;
			}
			this.resetTime();
		},1000);
	}
	updateTimerFromServer(){
		$.ajax({
			url: this.base_Url+"timernew",
			method: "GET",
			dataType: 'json',
			processData: false,
			contentType: false,
			success:(result)=>{
				
				console.log(this.predictions);
				this.waitTimeHorizontal=result.horizontal;
				this.waitTimeVertical=result.vertical;
			},
			error:(er)=>{

			}
		});
	}
	generateColor(){
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
	ngDoCheck(changes){
		//console.log(changes);
	}
	ngOnChanges(changes) {
		//console.log(changes);
	}
	initTimer(){
		clearTimeout(this.lightTimer);
		//clearTimeout(this.horizonalLight)
		this.lightTimer=setTimeout(()=>{
				if(this.horizonalLight>0){
					this.horizonalLight--;
					this.horizontalOb.next(this.horizonalLight);
				}
				if(this.verticalLight>0){
					this.verticalLight--;
					this.verticalOb.next(this.verticalLight);
				}
				this.initTimer();
		},1000);
	}
  addMore(){
	  this.requesttypedata.push(new Day())
	}
	filesGet(){
		var file:any=document.getElementById("file");
		this.csvfiles=file.files;
		console.log(this.csvfiles);
	}
  addFiles(){
  	var formData = new FormData();
  	var file:any=document.getElementById("file");
		formData.append("file", file.files[0]);
		$.ajax({
			url: this.base_Url+"upload",
			method: "POST",
			dataType: 'json',
			data: formData,
			processData: false,
			contentType: false,
			success:(result)=>{
				this.predictions=result.map(item=>{
					let data=this.getLightTimer(item)
					return {
						lightA:Math.floor(data.horizontal),
						lightB:Math.floor(data.vertical),
						date:moment(item.datetime).format("DD/MMM/YYYY")
					}
				});
				let timest=this.getLightTimer(result[0]);
				this.waitTimeHorizontal=timest.horizontal;
				this.waitTimeVertical=timest.vertical;
			},
			error:(er)=>{

			}
		});
	}
	getLightTimer(prediction){
		let timer=40;
		let predictionItem = {count:parseFloat(prediction.countPredA),countTest:parseFloat(prediction.countPredB)};
		console.log(predictionItem)
		return {
		horizontal:parseInt(((predictionItem.count/(predictionItem.count+predictionItem.countTest))*timer).toFixed(0)),
		vertical:parseInt(((predictionItem.countTest/(predictionItem.count+predictionItem.countTest))*timer).toFixed(0))
		}
	}
	resetV(){
	
		this.vVer=[new Vehicle(200,15,'red'),new Vehicle(260,15,'blue'),new Vehicle(320,15,'pink')];
	}
	resetH(){
		this.vHor=[new Vehicle(690,85,'red'),new Vehicle(750,85,'blue'),new Vehicle(810,85,'pink'),new Vehicle(870,85,'red'),new Vehicle(930,85,'blue'),new Vehicle(990,85,'pink')];
	}
	moveV(){
		if(this.verticalLight==0){
			$('.vch.up').each((i,item)=>{
				let left=parseInt($(item).css("left"))+1200;
				console.log(left);
				$(item).animate({left:(left+60)+'px'},{duration:3000,complete:()=>{
					if(i==0){
						$('.vch.down').hide();
						this.resetV();
						setTimeout(()=>{
							this.moveV();
						},3000)
					}
				}})
			
			});
		}
	}
	moveH(){
		if(this.horizonalLight==0){
			$('.vch.down').each((i,item)=>{
				let left=parseInt($(item).css("left"));
				console.log(left);
				$(item).animate({left:(-360+(60*i))+'px'},{duration:3000,complete:()=>{
					if(i==0){
			
						$('.vch.down').hide();
						this.resetH();
						setTimeout(()=>{
							this.moveH();
						},300)
						//this.moveH();
					}
				}})
			
			});
		}
		
	}
}
