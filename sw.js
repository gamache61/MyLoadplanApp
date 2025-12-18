dragControls = new THREE.DragControls(meshes, camera, renderer.domElement);
        
        // Track the previous position to calculate movement delta
        let prevPosition = new THREE.Vector3();

        dragControls.addEventListener('dragstart', (e) => { 
            orbit.enabled = false; 
            const group = e.object.parent;
            selectedUID = group.userData.uid;
            
            // Record where the mesh starts relative to the world
            prevPosition.copy(e.object.position);
            
            document.getElementById('side-delete-wrapper').classList.remove('hidden');
        });

        dragControls.addEventListener('drag', (e) => {
            const mesh = e.object;
            const group = mesh.parent;
            const t = app.trailers.find(x => x.id === app.activeTrailer);
            const item = app.load.find(x => x.uid === group.userData.uid);

            // Calculate how far the mouse moved the mesh since the last frame
            const deltaX = mesh.position.x - prevPosition.x;
            const deltaZ = mesh.position.z - prevPosition.z;

            // Apply that distance to the GROUP instead of the mesh
            group.position.x += deltaX;
            group.position.z += deltaZ;

            // Force the mesh back to center of group so the wireframe stays attached
            mesh.position.set(0, 0, 0); 
            prevPosition.set(0, 0, 0);

            // Boundary Constraints
            const hL = (t.l * SCALAR) / 2;
            const hW = (t.w * SCALAR) / 2;
            const halfItemL = (item.l * SCALAR) / 2;
            const halfItemW = (item.w * SCALAR) / 2;

            if (group.position.x - halfItemL < -hL) group.position.x = -hL + halfItemL;
            if (group.position.x + halfItemL > hL) group.position.x = hL - halfItemL;
            if (group.position.z - halfItemW < -hW) group.position.z = -hW + halfItemW;
            if (group.position.z + halfItemW > hW) group.position.z = hW - halfItemW;
            
            // Lock height to floor
            group.position.y = (item.h * SCALAR) / 2;

            // Sync with App Data
            item.x = (group.position.x + hL - halfItemL) / SCALAR;
            item.z = (group.position.z + hW - halfItemW) / SCALAR;
        });

        dragControls.addEventListener('dragend', () => { 
            orbit.enabled = true; 
            saveToStorage(); 
        });