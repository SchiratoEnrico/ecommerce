import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Dashboard } from './components/dashboard/dashboard';
import { RouterModule } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
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
import { TipoPagamentoDialog } from './components/dialog/tipo-pagamento-dialog/tipo-pagamento-dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';

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
    TipoPagamentoDialog,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatFormFieldModule,
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
    MatTableModule,
    MatSortModule,
    MatDialogModule,
    MatBadgeModule
],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
  ],
  bootstrap: [App],
})
export class AppModule {}
