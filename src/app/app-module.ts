import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Dashboard } from './components/dashboard/dashboard';
import { provideRouter, RouterModule, withHashLocation } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { TipoPagamentoDialog } from './components/admin/dialogs/tipo-pagamento-dialog/tipo-pagamento-dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogActions, MatDialogContent } from '@angular/material/dialog';
import { GestioneAnagrafica } from './components/admin/gestione-anagrafica/gestione-anagrafica';
import { AnagraficaDialog } from './components/admin/dialogs/anagrafica-dialog/anagrafica-dialog';
import { AccountDialog } from './components/admin/dialogs/account-dialog/account-dialog';
import { AutoreDialog } from './components/admin/dialogs/autore-dialog/autore-dialog';
import { GenereDialog } from './components/admin/dialogs/genere-dialog/genere-dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SpedizioniDialog } from './components/admin/dialogs/spedizioni-dialog/spedizioni-dialog';
import { GestioneSaghe } from './components/admin/gestione-saghe/gestione-saghe';
import { SagaDialog } from './components/admin/dialogs/saga-dialog/saga-dialog';
import { MangaDialog } from './components/admin/dialogs/manga-dialog/manga-dialog';
import { CasaEditriceDialog } from './components/admin/dialogs/casa-editrice-dialog/casa-editrice-dialog';
import { RigaOrdineDialog } from './components/admin/dialogs/riga-ordine-dialog/riga-ordine-dialog';
import { GestioneStatoOrdine } from './components/admin/gestione-stato-ordine/gestione-stato-ordine';
import { StatoOrdineDialog } from './components/admin/dialogs/stato-ordine-dialog/stato-ordine-dialog';
import { jwtInterceptor } from './auth/jwt-interceptor';
import { GestioneCarrello } from './components/admin/gestione-carrello/gestione-carrello';
import { Footer } from './components/footer/footer';
import { DettaglioCarrello } from './components/admin/dettaglio-carrello/dettaglio-carrello';
import { CommonModule } from '@angular/common';
import { MangaImgPipe } from './pipes/manga-img-pipe';
import { CheckoutDialog } from './components/checkout-dialog/checkout-dialog';
import { Pagamento } from './components/pagamento/pagamento';

// Import da feature/gestioni-fattura
import { GestioneFatture } from './components/admin/gestione-fatture/gestione-fatture';
import { OrdineDialog } from './components/admin/dialogs/ordine-dialog/ordine-dialog';
import { RigaFatturaDialog } from './components/admin/dialogs/riga-fattura-dialog/riga-fattura-dialog';
import { FatturaDialog } from './components/admin/dialogs/fattura-dialog/fattura-dialog';

// Import da develop
import { MailValidation } from './components/mail-validation/mail-validation';

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
    GestioneAnagrafica,
    AnagraficaDialog,
    AccountDialog,
    AutoreDialog,
    GenereDialog,
    SpedizioniDialog,
    GestioneSaghe,
    SagaDialog,
    MangaDialog,
    CasaEditriceDialog,
    OrdineDialog,
    RigaOrdineDialog,
    GestioneStatoOrdine,
    StatoOrdineDialog,
    GestioneCarrello,
    Footer,
    DettaglioCarrello,
    MangaImgPipe,
    CheckoutDialog,
    Pagamento,
    GestioneFatture,
    RigaFatturaDialog,
    FatturaDialog,
    MailValidation,
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
    MatBadgeModule,
    MatError,
    MatFormField,
    MatDialogActions,
    MatDialogContent,
    MatCheckboxModule,
    MatProgressBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatLabel,
    CommonModule,
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptors([jwtInterceptor]), withFetch()),
  ],
  bootstrap: [App],
})
export class AppModule {}