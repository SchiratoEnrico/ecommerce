import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Dashboard } from './components/dashboard/dashboard';
import { RouterModule } from '@angular/router';

import { MatFormField, MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatLabel, MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Login } from './components/login/login';
import { Home } from './components/home/home';
import { Carrello } from './components/carrello/carrello';
import { Ordini } from './components/ordini/ordini';
import { Profilo } from './components/profilo/profilo';
import { GestioneManga } from './components/admin/gestione-manga/gestione-manga';
import { GestioneAutori } from './components/admin/gestione-autori/gestione-autori';
import { GestioneGeneri } from './components/admin/gestione-generi/gestione-generi';
import { GestioneCaseEditrici } from './components/admin/gestione-case-editrici/gestione-case-editrici';
import { GestioneOrdini } from './components/admin/gestione-ordini/gestione-ordini';
import { GestioneAccount } from './components/admin/gestione-account/gestione-account';
import { GestioneSpedizioni } from './components/admin/gestione-spedizioni/gestione-spedizioni';
import { GestionePagamenti } from './components/admin/gestione-pagamenti/gestione-pagamenti';
import { Registrazione } from './components/registrazione/registrazione';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import {  MatTableModule } from '@angular/material/table';
import { GestioneAnagrafica } from './components/admin/gestione-anagrafica/gestione-anagrafica';
import { AnagraficaDialog } from './components/admin/dialogs/anagrafica-dialog/anagrafica-dialog';
import { AccountDialog } from './components/admin/dialogs/account-dialog/account-dialog';
import { AutoreDialog } from './components/admin/dialogs/autore-dialog/autore-dialog';
import { GenereDialog } from './components/admin/dialogs/genere-dialog/genere-dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SpedizioniDialog } from './components/admin/dialogs/spedizioni-dialog/spedizioni-dialog';

@NgModule({
  declarations: [
    App,
    Dashboard,
    Login,
    Home,
    Carrello,
    Ordini,
    Profilo,
    GestioneManga,
    GestioneAutori,
    GestioneGeneri,
    GestioneCaseEditrici,
    GestioneOrdini,
    GestioneAccount,
    GestioneSpedizioni,
    GestionePagamenti,
    Registrazione,
    GestioneAnagrafica,
    AnagraficaDialog,
    AccountDialog,
    AutoreDialog,
    GenereDialog,
    SpedizioniDialog
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatFormField,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatDividerModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule,
    MatPaginatorModule,
    MatError,
    MatFormField,
    MatDialogActions,
    MatDialogContent,
    MatLabel,
    MatTableModule,
    MatPaginator,
    MatLabel,
    MatCheckboxModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [App],
})
export class AppModule {}
