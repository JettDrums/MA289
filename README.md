# Pyhive: Humans Vs Machines

Pyhive offers a simulation space for testing UAS search algorithms. My initial approach will combine particle filters with gravity field search algorithms, and future research will rely on optimization of these algorithms with an eye towards multi-agent simulations.

## 𖥂 Installation and Setup
To clone into the Pyhive repository, run the following command:
```shell
git clone https://github.com/Sword-of-Stars/pyhive-hvm
```

Next, you'll need to install the necessary dependencies, found in `requirements.txt`:
```shell
pip install -r requirements.txt
```
Note that `requirements.txt` contains `pygame-ce`, not `pygame`, despite them having the same namespace. `pygame-ce` sees improved performance and community support over `pygame`.

Additionally, installing PySide6 requires Windows Long Paths to be enabled. To do so, reference [Appendix A](#enabling-windows-long-paths-as-of-27-mar-2025).

Finally, to run Pyhive, run the `main.py` file:

```shell
python3 main.py
```

This will populate the following GUI, where you can modify the particle field, drone behavior and quantity, and visualization options.

## 𖥂 GUI Overview

<p align="center">
    <img src=img/GUI_img.png>
</p>

| **Category**       | **Option**                 | **Description**                                                                                  | 
| ------------------ | -------------------------- | ------------------------------------------------------------------------------------------------ |
| **Admin**          | **ID**                     | Unique identifier for the simulation run                                                         | 
|                    | **Random Seed**            | Sets the random number generator seed to ensure reproducibility                                  | 
| **Visualizations** | **Save plot?**             | Saves a static plot of the results at the end of the run                                         |
|                    | **Show plot?**             | Displays a summary plot after the simulation finishes                                            | 
|                    | **Show simulation?**       | Displays the real-time particle simulation during execution                                      | 
|                    | **Save to movie?**         | Exports the animation as a movie file for playback                                               | 
| **Particle Field** | **Shape**                  | Selects the terrain or boundary shape for the particle field                                     | 
|                    | **Source Image**           | Specifies the field image for the search area                                                    |
|                    | **Target**                 | Defines the target the agent is trying to find, relying on `/data/terrain/weights.json`         |
|                    | **Number of particles**    | Sets how many particles to simulate in the environment                                           |
|                    | **Include antiparticles?** | Enables dual-particle behavior for decay or neutralization modeling                              |
| **Drones**         | **Number of drones**       | Determines how many UAV agents operate in the simulation                                         |
|                    | **Starting location(s)**   | Defines the spawn point(s) for the drone(s)                                                      |
|                    | **Steering algorithm**     | Selects the drone navigation or behavior model                                                   |
| **Config I/O**     | **Import**                 | Loads an existing configuration file                                                             |
|                    | **Save**                   | Saves the current configuration to file                                                          |
|                    | **Run Batch**              | Executes multiple simulations in sequence through the batch scheduler                            |
| **Execution**      | **Run**                    | Starts the simulation with the specified parameters                                              |

## 𖥂 Codebase Orientation
This section provides a high-level overview of the functionality and flow for `pyhive`. 

#### `main.py`
Basic launching point for launching Pyhive. It sets the current working directory to `/pyhive`, then creates a GUI for modifying and running simulations.

#### `/data`
Stores the neccesary data to sun a simulation, including terrain masks and a `config.json` file

#### `/data/config.json`
Configures the default settings for a simulation. Most likely, you won't be modifying this file; changing simulation parameters is handled in the GUI

#### `/data/terrain/weights.json`
Sets the relative weights of various terrain types for particles in the simulation

#### `/out`
Default directory for simulation outputs

Each time a simulation is run, a plot of the information entropy and cumulative density function of the simulation over time is saved to this folder. Its name reflects its simulation ID. 

Additionally, if the `visible` and `save_to_mov` flags in the `config.json` file are set to true, a recording of the simulation is saved here.

#### `/scripts`
Contains all scripts needed to run Pyhive. Pertient ones are explained below.

#### `/scripts/simulation.py`
Handles the simulation, from initialization to termination

#### `/drone.py`
Contains the `drone` class, representing an agent in the simulation space

#### `/field.py`
Generates the particle filter

#### `/algorithms.py`
Describes the various movement algorithms determining the drone's path. Currently supports `gravity`, `expandingSpiral`, `lawnmower`, `set_Path`, and `manual`, but more are coming soon!

#### `/terrain.py`
Seeds a particle filter from terrain, using a weights-based approach

#### `/utils.py`
Functionality for trigonometry, vector calculations, and file I/O

## 𖥂 Contributions and Version Control
Thanks for contributing to Pyhive! Here's some contribution guidelines to keep the repository organized:

* Whatever is pushed to this `main` branch of Pyhive *must* be a stable build; put experiments in the `lab` folder.
* Please note any changes to Pyhive in `DEVLOG.md`. These do not need to be exhaustive or comprehensive, but they should provide a data and a brief summary of changes
* Any code not directly accessed by a Pyhive script should be placed in the parent repository; please don't clutter this up with loose files

### ➤ How Can I Contribute?
Ongoing contributions can focus on
* Working out bugs in `app.py`
* Cleaning up logic in `/scripts/algorithms.py`
* ... and as always, reviewing and extending documentation is always appreciated!

### Contributors
* Sword-of-Stars
* JasonIngersoll9000

## Appendices

### Appendix A: Enabling Windows Long Paths (as of 27 MAR 2025)
1.  **Open Group Policy Editor:**
    * Press `Win + R` to open the Run dialog.
    * Type `gpedit.msc` and press Enter.

2.  **Navigate to the Policy:**
    * In the Group Policy Editor window, navigate to the following path:
        * `Computer Configuration` > `Administrative Templates` > `System` > `Filesystem`

3.  **Enable the Policy:**
    * In the right pane, locate the "Enable Win32 long paths" option.
    * Double-click on "Enable Win32 long paths".
    * Select the "Enabled" radio button.
    * Click "Apply" and then "OK".

4.  **Apply and Restart:**
    * Close the Group Policy Editor.
    * Restart your computer for the changes to take effect.

After restarting, you should be able to create and access files with paths exceeding 260 characters.