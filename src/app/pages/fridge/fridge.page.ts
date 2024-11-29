import { Component, OnInit } from '@angular/core';
import { OpenaiService } from 'src/app/services/openai.service';
import { AuthService } from '../../auth.service';
import { getDatabase, ref, get, remove } from 'firebase/database';
import { Router } from '@angular/router';  // Importar Router
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-fridge',
  templateUrl: './fridge.page.html',
  styleUrls: ['./fridge.page.scss'],
})
export class FridgePage implements OnInit {
  recipes: any[] = [];  // Lista de recetas guardadas, ahora incluye ID de Firebase
  userId: string = '';  // ID del usuario
  loading: boolean = true; // Indicador de carga

  constructor(
    private changeDetector: ChangeDetectorRef,
    private openaiService: OpenaiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el userId del usuario logueado
    this.authService.getCurrentUser().then(user => {
      if (user) {
        this.userId = user.uid; // Asignamos el UID del usuario actual
        console.log('Usuario actual:', user);
        this.loadSavedRecipes(); // Cargamos las recetas guardadas
      }
    }).catch((error) => {
      console.error('Error al obtener usuario:', error);
    });
  }
  
  // Método para cargar las recetas desde Firebase
// Método para cargar las recetas desde Firebase
loadSavedRecipes() {
  const db = getDatabase();
  const recipeRef = ref(db, 'recipes/' + this.userId);

  get(recipeRef).then((snapshot) => {
    this.loading = false;
    if (snapshot.exists()) {
      const recipesArray: any[] = [];
      snapshot.forEach((childSnapshot) => {
        const recipeData = childSnapshot.val();
        recipesArray.push({ ...recipeData, id: childSnapshot.key });
      });
      this.recipes = recipesArray;
      this.changeDetector.detectChanges(); // Forzamos la detección de cambios
    } else {
      this.recipes = [];
    }
  }).catch((error) => {
    this.loading = false;
    console.error('Error al cargar las recetas:', error);
  });
}


  // Método para eliminar una receta de Firebase
  deleteRecipe(recipeId: string) {
    const db = getDatabase();  // Usamos getDatabase para obtener la instancia de la base de datos
    const recipeRef = ref(db, 'recipes/' + this.userId + '/' + recipeId);  // Referencia específica a la receta

    remove(recipeRef)  // Eliminar la receta de Firebase
      .then(() => {
        console.log('Receta eliminada');
        this.loadSavedRecipes();  // Recargamos las recetas después de eliminarla
      })
      .catch((error) => {
        console.error('Error al eliminar la receta:', error);
      });
  }
    // Función para redirigir a la página de OpenAI
    goToOpenAI() {
      this.router.navigate(['/openai']);
    }
}
