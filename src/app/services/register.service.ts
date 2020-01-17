import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const httpOptions = {
    headers: new HttpHeaders({
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Headers": "Content-type",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    })
};

@Injectable({
    providedIn: 'root'
})

export class RegisterService {
    private user:Subject<string> = new BehaviorSubject<string>(undefined);
    private baseURL: string = "http://localhost:8888/";
    //token: string;

    constructor(private http: HttpClient) { }

    getUser() { return this.user; }

    saveUser(user){
        return this.http.post(this.baseURL+'membres/add', JSON.stringify(user), httpOptions);
    }

    connect(data: string) { this.user.next(data); }
}