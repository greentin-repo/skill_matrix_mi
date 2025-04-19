import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Directive({
  selector: '[getFileInfo]'
})
export class CustomDirective implements OnInit {
  @Input('getFileDet') fileDet: any;
  constructor(private el: ElementRef,
    private sanitization: DomSanitizer) { }
  ngOnInit(): void {
    var img;
    console.log(this.fileDet);
    var fileName = this.fileDet.name;
    var filepath = this.fileDet.docPath;
    if (fileName == undefined) {
      var name = filepath.substring(filepath.lastIndexOf('/') + 1);
      var file = this.file_get_ext(name);
    } else {
      var file = this.file_get_ext(fileName);
    }
    // if (file == 'doc' || file == 'docx' || file == 'txt') {
    //   img = '<img src="assets/images/fileIcons/doc.png" class="UploadDoc" />';
    // } else if (file == 'pdf') {
    //   img = '<img src="assets/images/fileIcons/pdf.png" class="UploadDoc"/>';
    // } else if (file == 'xls' || file == 'xlx' || file == 'xlsx') {
    //   img = '<img src="assets/images/fileIcons/xls.png" class="UploadDoc"/>';
    // } else
    if (file == 'jpg' || file == 'png' || file == 'jpeg' || file == 'JPG' || file == 'PNG' || file == 'JPEG' || file == 'gif' || file == 'svg') {
      img = '<img src="' + filepath + '" class="UploadImg" (error)="onImgError($event)"/>';
    } else {
      img = '<img src="assets/images/fileIcons/doc.png" class="UploadDoc" />';
    }
    this.el.nativeElement.innerHTML = img;
  }
  onImgError(event) {
    console.log(event);
    event.target.src = 'assets/images/fileIcons/no-photo.png';
  }
  file_get_ext(filename) {
    return typeof filename != "undefined" ? filename.substring(filename.lastIndexOf(".") + 1, filename.length).toLowerCase() : false;
  }
  getSanitizedUrl(url) {
    return this.sanitization.bypassSecurityTrustStyle("url(" + url + ")");
  }
}
