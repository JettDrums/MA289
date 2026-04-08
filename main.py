import os
import sys
import json
import random
import pygame
from PySide6.QtWidgets import QApplication

from src.simulation import Simulation
from src.research_app import run_research_app
from src.generate_config import generate_config
from src.results_app import show_images
from src.conclusion_app import show_final_instructions

VERSION = "1.2.1"
MODES = ["tutorial", "round1", "round2"]
SEED = 42

def main():
    app = QApplication([])
    name, mode = run_research_app(app, version=VERSION)

    if not name:
        print("User cancelled.")
        return

    # ---------------------------------------
    # Load master game configuration
    # ---------------------------------------
    with open("data/config/game_of_drones.json", "r", encoding="utf-8") as f:
        game_config = json.load(f)

    current_mode_idx = MODES.index(mode) if mode in MODES else 0
    relevant_modes = MODES[current_mode_idx:]
    previous_modes = MODES[:current_mode_idx]


    # Used to keep global unique simulation IDs
    _id = sum(len(game_config.get(m, {}).get("images", [])) for m in previous_modes)

    configs = {}

    # ---------------------------------------
    # Generate configs
    # ---------------------------------------
    for m in relevant_modes:
        mode_data = game_config.get(m, {})

        images = mode_data.get("images", [])
        if mode_data.get("randomize", False):
            random.shuffle(images)

        for img in images:
            img_filename = f"{int(img):03d}.png"

            cfg = generate_config(
                img_filename,
                seed=SEED,
                username=name,
                _id=_id
            )

            filename = f"{m}_{_id:04d}.json"
            configs[filename] = cfg

            _id += 1

    if not configs:
        print("No configurations generated.")
        return

    # ---------------------------------------
    # Save configs
    # ---------------------------------------
    any_cfg = next(iter(configs.values()))
    out_folder = any_cfg.get("output_path", f"research_{os.getpid()}")
    target_dir = os.path.join("data", "research_configs", out_folder)
    os.makedirs(target_dir, exist_ok=True)

    for filename, cfg in configs.items():
        file_path = os.path.join(target_dir, filename)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(cfg, f, indent=4)

    print(f"Saved {len(configs)} configuration(s) to: {target_dir}")
    for filename in sorted(configs.keys()):
        print(" -", os.path.join(target_dir, filename))

    # ---------------------------------------
    # Run simulations
    # ---------------------------------------
    print("Starting simulations...")


    #Performance_review (Non)
    IMAGE_PATH_TEMPLATE = "data/terrain/standardized_images/{:03d}.jpg"
    ############

   # Run simulations in correct mode progression order
    for m in relevant_modes:

        #Performance_review (Non)
        images = []
        AAC_round_list = []
        time_round_list = []

        mode_data = game_config.get(m, {})
        images_in_mode = mode_data.get("images", [])
        

        for img in images_in_mode:
            full_img_path = IMAGE_PATH_TEMPLATE.format(int(img))
            images.append(full_img_path)
        #Make sure to delete the previous list
        ###########


        pygame.init()
        
        WIDTH, HEIGHT = 580, 740

        screen = pygame.display.set_mode(
            (WIDTH, HEIGHT),
            flags=pygame.RESIZABLE | pygame.HIDDEN
        )

        pygame.display.set_caption(f"PyHive v{VERSION} - {name} - {m}")

        for filename in sorted(configs.keys()):
            if not filename.startswith(m):
                continue

            file_path = os.path.join(target_dir, filename)

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
            except Exception as e:
                print(f"Failed to load {file_path}: {e}")
                continue

            sim = Simulation(
                cfg,
                version=VERSION,
                screen=screen,
                size=(WIDTH, HEIGHT)
            )

            sim.run()

            #Perfromance review (Non)
            output_AAC_round = sim.data.data["AAC"]
            AAC_round_list.append(output_AAC_round)
            output_time_round = sim.data.elapsed
            time_round_list.append(output_time_round)
            #############
     
        # exit the simulation window before showing results
        pygame.quit()

        #Perfromance review (Non)
        if not show_images(images, time_round_list, AAC_round_list):
            break
        #########


    show_final_instructions()
    
        
if __name__ == '__main__':
    main()
    sys.exit()
