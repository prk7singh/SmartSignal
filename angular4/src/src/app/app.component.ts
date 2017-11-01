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
	base_Url="http://localhost:5000/";
	vHor:Vehicle[]=[new Vehicle(100,85,'red'),new Vehicle(160,85,'blue'),new Vehicle(160,85,'pink')];
	vVer:Vehicle[]=[new Vehicle(180,620,'magenta'),new Vehicle(180,680,'yellow')];

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
		let predictionItem = {count:parseFloat(prediction.count),countTest:parseFloat(prediction.countTest)};
		console.log(predictionItem)
		return {
			horizontal:parseInt(((predictionItem.count/(predictionItem.count+predictionItem.countTest))*timer).toFixed(0)),
			vertical:parseInt(((predictionItem.countTest/(predictionItem.count+predictionItem.countTest))*timer).toFixed(0))
		}
	}
	resetV(){
		this.vVer.length=0;
		this.vVer.push.apply(this.vVer,[new Vehicle(this.leftCanvas,620,this.generateColor()),new Vehicle(this.leftCanvas,680,this.generateColor())])
	}
	resetH(){
		this.vHor.length=0;
		if(this.horizonalLight!=0){
			this.vHor=[new Vehicle(100,85,'red'),new Vehicle(160,85,'blue'),new Vehicle(160,85,'blue')];
		}
		else{
			this.vHor.push.apply(this.vHor,[new Vehicle(1300,85,this.generateColor()),new Vehicle(1360,85,this.generateColor()),new Vehicle(1420,85,this.generateColor())]);
		}
	}
	moveV(){
		$('.vcv').each((i,item)=>{
			let variation=i+1;
			let animationtime=variation*600;
			let posoffset=$("#canvas").offset();
			let heightCan=$("#canvas").height();
			this.leftCanvas=posoffset.left+20;
			let leftCnv=(posoffset.top+heightCan/2 -50);
			$(item).animate({top:i==0?(leftCnv)+'px':posoffset.top+'px'},{duration:i==0?animationtime:animationtime*2,complete:()=>{
				if(i==0){
					$(item).animate({deg: 180}, {
						duration: 150+(i*40),
						step: function(now) {
								$(item).css({
										transform: 'rotate(' + now + 'deg)'
								});
						},
						complete:()=>{
							let movement=(840-(i*50))+'px';
							let dir:any={}
							dir={left:movement};
							$(item).animate(dir,animationtime);
							setTimeout(()=>{
								this.resetV();
								if(this.verticalLight==0){
									setTimeout(()=>{
										this.moveV();
									},1000);	
								}
							},animationtime*4);	
						}
					});
				}
				else{
				}	
			}});
		});
	}
	moveH(){
		$('.vch').each((i,item)=>{
			let variation=i+1;
			let animationtime=variation*600;
			$(item).animate({left:'-60px'},{duration:animationtime,complete:()=>{
				$(item).animate({deg: -90}, {
					duration: 150+(i*40),
					step: function(now) {
							$(item).css({
									transform: 'rotate(' + now + 'deg)'
							});
					},
					complete:()=>{
						let movement=(240-(i*50))+'px';
						//console.log(movement);
						$(item).animate({top:movement},{duration:animationtime,complete:()=>{
							 setTimeout(()=>{
								$('.vch').fadeOut(500);
								this.resetH();
								if(this.horizonalLight==0 && i==1){
									//console.log(movement);
									setTimeout(()=>{
										this.moveH();
									},1)
								
								}
							 },animationtime*4);
						}});	
					}
				});
				
			}});
		
		})
		//$('.vch')
	}
}
