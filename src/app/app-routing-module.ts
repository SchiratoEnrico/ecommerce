import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componenti
import { Login } from './components/login/login';
import { Registrazione } from './components/registrazione/registrazione';
import { Dashboard } from './components/dashboard/dashboard';
import { Home } from './components/home/home';
import { Carrello } from './components/carrello/carrello';
import { Ordini } from './components/ordini/ordini';
import { Profilo } from './components/profilo/profilo';

// Componenti Admin
import { GestioneAccount } from './components/admin/gestione-account/gestione-account';
import { GestioneAutori } from './components/admin/gestione-autori/gestione-autori';
import { GestioneCaseEditrici } from './components/admin/gestione-case-editrici/gestione-case-editrici';
import { GestioneGeneri } from './components/admin/gestione-generi/gestione-generi';
import { GestioneManga } from './components/admin/gestione-manga/gestione-manga';
import { GestioneOrdini } from './components/admin/gestione-ordini/gestione-ordini';
import { GestionePagamenti } from './components/admin/gestione-pagamenti/gestione-pagamenti';
import { GestioneSpedizioni } from './components/admin/gestione-spedizioni/gestione-spedizioni';
import { GestioneAnagrafica } from './components/admin/gestione-anagrafica/gestione-anagrafica';
import { GestioneSaghe } from './components/admin/gestione-saghe/gestione-saghe';

// Guards
import { authAuthenticatedGuard } from './auth/auth-authenticated-guard';
import { authAdminGuard } from './auth/auth-admin-guard';

const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      // ── Area Utente Pubblica / Registrata ──
      { path: 'home',     component: Home },
      { path: 'carrello', component: Carrello, canActivate: [authAuthenticatedGuard] },
      { path: 'ordini',   component: Ordini,   canActivate: [authAuthenticatedGuard] },
      { path: 'profilo',  component: Profilo,  canActivate: [authAuthenticatedGuard] },

      // ── Area Admin (Doppia protezione: Loggato + Admin) ──
      { path: 'admin/manga',             component: GestioneManga,         canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/saghe',             component: GestioneSaghe,         canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/autori',            component: GestioneAutori,        canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/generi',            component: GestioneGeneri,        canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/case-editrici',     component: GestioneCaseEditrici,  canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/ordini',            component: GestioneOrdini,        canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/account',           component: GestioneAccount,       canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/gestione-anagrafica', component: GestioneAnagrafica,  canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/spedizioni',        component: GestioneSpedizioni,    canActivate: [authAuthenticatedGuard, authAdminGuard] },
      { path: 'admin/pagamenti',         component: GestionePagamenti,     canActivate: [authAuthenticatedGuard, authAdminGuard] }
    ]
  },
  
  // ── Pagine esterne alla Dashboard ──
  { path: 'login', component: Login },
  { path: 'registrazione', component: Registrazione },
  
  // ── Fallback ──
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }