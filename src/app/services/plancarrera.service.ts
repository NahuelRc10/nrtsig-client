import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { BASE_ENDPOINT_CARRERAS } from '../config/app';
import { Observable } from 'rxjs';
import { PlanCarrera, PlanCarreraFiltrosDTO } from '../models/carrera.models';

@Injectable({
  providedIn: 'root'
})
export class PlancarreraService {

  cabeceras: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
  endPointBase = BASE_ENDPOINT_CARRERAS + '/plancarrera';

  constructor(private http: HttpClient) { }

  obtenerPlanCarreraVigente(idCarrera: number): Observable<PlanCarrera> {
    return this.http.get<PlanCarrera>(this.endPointBase + '/plan-carrera-vigente/' + idCarrera);
  }

  save(planCarrera: PlanCarrera): Observable<PlanCarrera> {
    return this.http.post<PlanCarrera>(this.endPointBase, planCarrera);
  }

  cerrarPlanCarrera(id: number): Observable<void> {
    return this.http.put<void>(this.endPointBase + '/' + id + '/cerrar-plancarrera', null);
  }

  eliminarPlanCarrera(id: number): Observable<void> {
    return this.http.delete<void>(this.endPointBase + '/' + id);
  }

  listar(): Observable<PlanCarrera[]> {
    return this.http.get<PlanCarrera[]>(this.endPointBase);
  }

  search(filter: PlanCarreraFiltrosDTO): Observable<PlanCarrera[]> {
    return this.http.post<PlanCarrera[]>(this.endPointBase + '/search', filter);
  }

  crearPlan(planCarrera: PlanCarrera): Observable<PlanCarrera> {
    return this.http.post<PlanCarrera>(this.endPointBase, planCarrera);
  }
}
