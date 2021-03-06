import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Carrera, TipoCarrera, Departamento, PlanCarrera } from 'src/app/models/carrera.models';
import { CarreraService } from 'src/app/services/carrera.service';
import { PlancarreraService } from 'src/app/services/plancarrera.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PATTERN_ONLYLETTERS, PATTERN_ONLYNUMBER, ERROR_MESSAGE } from 'src/app/shared/constants';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AsignarPlancarreraComponent } from '../asignar-plancarrera/asignar-plancarrera.component';
import { PlanCarreraViewComponent } from '../../plan-carrera/plan-carrera-view/plan-carrera-view.component';

@Component({
  selector: 'app-carrera-edit',
  templateUrl: './carrera-edit.component.html',
  styleUrls: ['./carrera-edit.component.css']
})
export class CarreraEditComponent implements OnInit {

  titulo: string;
  formulario: FormGroup;
  carrera: Carrera = new Carrera();
  error: string;
  comboTipoCarrera: TipoCarrera[] = [];
  comboDepartamento: Departamento[] = [];
  displayedColumnsPlanCarrera: string[] = ['id', 'anioPlan', 'fechaCierre', 'resolucion', 'dpto', 'acciones'];
  displayedColumnsAsignaturas: string[] = [''];
  planesCarreraDataSource: PlanCarrera[] = [];
  flagError: boolean = false;
  flagAddPlanCarreraButton: boolean = false;
  flagEditButton: boolean = false;
  
  constructor(private carreraService: CarreraService,
              private planCarreraService: PlancarreraService,
              private fb: FormBuilder,
              private activatedRoute: ActivatedRoute,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      const id: number = Number (params.get('id'));
      this.carreraService.getCarrera(id).subscribe(data => {
        this.carrera = data;
        this.titulo = `CARRERA DE ${this.carrera.nombre}`
        this.titulo.toUpperCase();
        this.createForm();
        this.loadData();
        this.planCarreraService.obtenerPlanCarreraVigente(this.carrera.id).subscribe(dataPlan => {
          let planCarrera = dataPlan;
          if (planCarrera != null) {
            this.planesCarreraDataSource.push(planCarrera);
            this.flagAddPlanCarreraButton = true;
          }
        })
      });
    });
  }

  public createForm() {
    this.formulario = this.fb.group({
      nombreCarrera: ['', Validators.compose([Validators.required])],
      nombreCorto: ['', Validators.compose([Validators.required, Validators.pattern(PATTERN_ONLYLETTERS)])],
      duracion: ['', Validators.compose([Validators.required, Validators.pattern(PATTERN_ONLYNUMBER)])],
      descripcion: ['', ],
      tipoCarrera: ['', [Validators.required]],
      departamento: ['', [Validators.required]],
    });
  }

  public loadData(): void {
    this.formulario.controls['nombreCarrera'].setValue(this.carrera.nombre);
    this.formulario.controls['nombreCorto'].setValue(this.carrera.nombreCorto);
    this.formulario.controls['duracion'].setValue(this.carrera.duracion);
    this.formulario.controls['descripcion'].setValue(this.carrera.descripcion);
    this.formulario.controls['tipoCarrera'].setValue(this.carrera.tipoCarrera.tipoCarrera);
    this.formulario.controls['departamento'].setValue(this.carrera.departamento.denominacion);

    // DESHABILITAR LOS CAMPOS QUE NO SE PUEDEN MODIFICAR
    this.formulario.controls['tipoCarrera'].disable();
    this.formulario.controls['departamento'].disable();
  }

  public onChangeNombreCarrera(): void {
    this.carrera.nombre = this.formulario.controls['nombreCarrera'].value;
  }

  public onChangeNombreCorto(): void {
    this.carrera.nombreCorto = this.formulario.controls['nombreCorto'].value;
  }

  public onChangeDuracion(): void {
    this.carrera.duracion = this.formulario.controls['duracion'].value;
  }

  public onChangeDescripcion(): void {
    this.carrera.descripcion = this.formulario.controls['descripcion'].value;
  }

  public verPlanCarrera(planCarrera: PlanCarrera): void {
    const modalRef = this.dialog.open(PlanCarreraViewComponent, {
      width: '50%',
      data: { planCarrera: planCarrera }
    });
    modalRef.afterClosed().subscribe(data => {
      this.ngOnInit();
    })
  }

  public edit() {
    this.loadData();
    this.flagEditButton = false;
    this.habilitarCampos();
  }

  public habilitarCampos() {
    this.formulario.controls['nombreCarrera'].enable();
    this.formulario.controls['nombreCorto'].enable();
    this.formulario.controls['duracion'].enable();
    this.formulario.controls['descripcion'].enable();
  }

  public save() {
    // Guardar la carrera
    this.carreraService.editarCarrera(this.carrera).subscribe(data => {
      this.carrera = data;
      Swal.fire('Nuevo:', `Carrera ${this.carrera.nombre} actualizada con exito!`, 'success');
      // Deshabilitar los campos del formulario carrera para poder ingresar en el plan de carreras y las materias
      this.formulario.controls['nombreCarrera'].disable();
      this.formulario.controls['nombreCorto'].disable();
      this.formulario.controls['duracion'].disable();
      this.formulario.controls['descripcion'].disable();
      this.formulario.controls['tipoCarrera'].disable();
      this.formulario.controls['departamento'].disable();
      this.flagEditButton = true;

      // En caso de que la bandera de error este en true, set en false
      if (this.flagError === true) {
        this.flagError = false;
      }
    }, (err: HttpErrorResponse) => {
      if (err.status === 500) {
        // Manejar el error del backend
        this.error = ERROR_MESSAGE;
        this.flagError = true;
      }
      if (err.status === 400) {
        this.error = ERROR_MESSAGE;
        this.flagError = true;
      }
    });
  }

  public asignarPlanCarrera(): void {
    const modalRef = this.dialog.open(AsignarPlancarreraComponent, {
      width: '75%',
      data: { carrera: this.carrera }
    });
    modalRef.afterClosed().subscribe(data => {
      // Request para completar la grilla con el plan de carrera
      this.planCarreraService.obtenerPlanCarreraVigente(this.carrera.id).subscribe(data => {
        let planCarreraVigente = data;
        if (planCarreraVigente != null) {
          this.planesCarreraDataSource.push(planCarreraVigente);
        }
      });
      this.carreraService.activarCarrera(this.carrera.id).subscribe(data1 => {
        // Se activa la carrera
      });
      let planCarreraVigenteFlag = this.carrera.planesCarrera.filter(p => p.anioPlan != null);
      if (planCarreraVigenteFlag.length > 0) {
        this.flagAddPlanCarreraButton = true;
      }
    });
  }

  public cerrarPlan(planCarrera: PlanCarrera) {
    this.planCarreraService.cerrarPlanCarrera(planCarrera.id).subscribe(data => {
      this.flagAddPlanCarreraButton = false;
      this.planesCarreraDataSource = [];
      this.carreraService.desactivarCarrera(planCarrera.carrera.id).subscribe(data => {
        Swal.fire('Atencion', 'La carrera ha sido desactivada', 'info');
      });
    });
  }

  public eliminarPlanCarrera(planCarrera: PlanCarrera) {
    this.planCarreraService.eliminarPlanCarrera(planCarrera.id).subscribe(data => {
      Swal.fire('Eliminado', 'Plan Carrera eliminado con exito!', 'success');
    })
  }
}
