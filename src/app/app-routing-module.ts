import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './components/login/login';
import { authAdminGuard } from './auth/auth-admin-guard';
import { GestioneAccount } from './components/admin/gestione-account/gestione-account';
import { GestioneAutori } from './components/admin/gestione-autori/gestione-autori';
import { GestioneCaseEditrici } from './components/admin/gestione-case-editrici/gestione-case-editrici';
import { GestioneGeneri } from './components/admin/gestione-generi/gestione-generi';
import { GestioneManga } from './components/admin/gestione-manga/gestione-manga';
import { GestioneOrdini } from './components/admin/gestione-ordini/gestione-ordini';
import { GestionePagamenti } from './components/admin/gestione-pagamenti/gestione-pagamenti';
import { GestioneSpedizioni } from './components/admin/gestione-spedizioni/gestione-spedizioni';
import { Carrello } from './components/carrello/carrello';
import { Home } from './components/home/home';
import { Ordini } from './components/ordini/ordini';
import { Profilo } from './components/profilo/profilo';
import { authAuthenticatedGuard } from './auth/auth-authenticated-guard';
import { Registrazione } from './components/registrazione/registrazione';
import { GestioneAnagrafica } from './components/admin/gestione-anagrafica/gestione-anagrafica';
import { GestioneSaghe } from './components/admin/gestione-saghe/gestione-saghe';
import { GestioneStatoOrdine } from './components/admin/gestione-stato-ordine/gestione-stato-ordine';
import { GestioneCarrello } from './components/admin/gestione-carrello/gestione-carrello';
import { Pagamento } from './components/pagamento/pagamento';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',    component: Home },
  { path: 'carrello', component: Carrello, canActivate:[authAuthenticatedGuard] },
  { path: 'ordini',   component: Ordini, canActivate:[authAuthenticatedGuard] },
  { path: 'profilo',  component: Profilo, canActivate:[authAuthenticatedGuard] },
  { path: 'login',    component: Login },
  { path: 'registrazione', component: Registrazione },
  { path: 'pagamento', component: Pagamento, canActivate:[authAuthenticatedGuard] },


  // ── Admin (protette dal guard) ──
  { path: 'admin/manga',          component: GestioneManga,         canActivate: [authAuthenticatedGuard, authAdminGuard] },
  { path: 'admin/autori',         component: GestioneAutori,        canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/generi',         component: GestioneGeneri,        canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/case-editrici',  component: GestioneCaseEditrici,  canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/ordini',         component: GestioneOrdini,        canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/account',        component: GestioneAccount,       canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/spedizioni',     component: GestioneSpedizioni,    canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/pagamenti',      component: GestionePagamenti,     canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/gestione-anagrafica', component: GestioneAnagrafica, canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/gestione-ordini', component: GestioneOrdini, canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/stato-ordine', component: GestioneStatoOrdine, canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/saghe', component: GestioneSaghe, canActivate: [authAuthenticatedGuard,authAdminGuard] },
  { path: 'admin/gestione-carrello', component: GestioneCarrello, canActivate: [authAuthenticatedGuard,authAdminGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}