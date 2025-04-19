import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { Alert, AlertType } from './alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<Alert>();
  private defaultId = 'default-alert';
  options = {
    autoClose: false,
    keepAfterRouteChange: false
  };
  // enable subscribing to alerts observable
  onAlert(id = this.defaultId): Observable<Alert> {
    return this.subject.asObservable().pipe(filter(x => x && x.id === id));
  }

  // convenience methods
  success(message: string) {
    // this.alert(new Alert({ ...this.options, type: AlertType.Success, message }));
    Swal.fire({
      icon: 'success',
      // title: 'Oops...',
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      confirmButtonColor: '#7044CD',
      customClass: {
        container: 'successErrorSwal',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }

  error(message: string) {
    // this.alert(new Alert({ ...this.options, type: AlertType.Error, message }));
    Swal.fire({
      icon: 'error',
      // title: 'Oops...',
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      confirmButtonColor: '#f27474',
      customClass: {
        container: 'successErrorSwal',
      },
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    })
  }

  closeSwal() {
    Swal.close();
  }

  info(message: string) {
    this.alert(new Alert({ ...this.options, type: AlertType.Info, message }));
  }

  warn(message: string) {
    this.alert(new Alert({ ...this.options, type: AlertType.Warning, message }));
  }

  // main alert method    
  alert(alert: Alert) {
    alert.id = alert.id || this.defaultId;
    this.subject.next(alert);
  }

  // clear alerts
  clear(id = this.defaultId) {
    this.subject.next(new Alert({ id }));
  }
}
