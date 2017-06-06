import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";

import { AlertService } from '../_services/index';
import { Http, Headers, Response } from '@angular/http';
import { AppConfig } from '../app.config';
import { Movie } from '../_models/movie';
import { User } from '../_models/index';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})

export class PlayerComponent implements OnInit {
  movie: string;
  source: string;
  website: string;
  loading = false;
  movieInfo: Movie[];
  user = "ok";
  currentUser: User;

  constructor(
    private http: Http,
    private config: AppConfig,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.route.snapshot.queryParams['movie'] && this.route.snapshot.queryParams['source']) {
      this.movie = this.route.snapshot.queryParams['movie'];
      this.website = this.route.snapshot.queryParams['source'];
    }
  }

  ngOnInit() {
    this.http.post(this.config.apiUrl + '/torrentdl/info', { torrentid: this.movie, source: this.website })
      .subscribe(
      data => {
        let response = data.json();
        this.movieInfo = response[0];
        console.log(this.movieInfo);
      },
      error => {
        console.log(error);
      });
    if (this.movie && this.website) {
      this.loading = true;
      this.http.post(this.config.apiUrl + '/torrentdl', { torrentid: this.movie, source: this.website, user: this.currentUser })
        .subscribe(
        data => {
          if (data.text() === 'Error')
            this.alertService.error("No video found.");
          else
            this.source = data.text();
          this.loading = false;
        },
        error => {
          this.alertService.error("No video found.");
          this.loading = false;
        });
    } else
      this.router.navigate(['/']);
  }
}
