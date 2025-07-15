<?php

if (!defined('_PS_VERSION_')) {
    exit;
}

class Commercialsales extends Module
{
    public function __construct()
    {
        $this->name = 'commercialsales';
        $this->version = '1.0.0';
        $this->author = 'Aitor';
        $this->tab = 'administration';
        $this->need_instance = 0;
        $this->bootstrap = true;

        parent::__construct();

        $this->displayName = $this->l('Gestor de Ventas Comerciales');
        $this->description = $this->l('Visualiza y calcula las ventas por comercial.');
    }

    public function install()
    {
        if (!parent::install()) {
            return false;
        }

        $parentId = $this->installParentTab();
        if (!$parentId) {
            return false;
        }

        return $this->installChildTabs($parentId);
    }

    public function uninstall()
    {
        return parent::uninstall()
            && $this->uninstallTabs();
    }

    private function installParentTab()
    {
        $tab = new Tab();
        $tab->active = 1;
        $tab->class_name = 'AdminZonaComerciales'; // clase del tab padre
        $tab->name = [];

        foreach (Language::getLanguages(true) as $lang) {
            $tab->name[$lang['id_lang']] = 'Zona Comerciales';
        }

        $tab->id_parent = 0;
        $tab->module = $this->name;

        if ($tab->add()) {
            return $tab->id; // devolvemos el ID del tab padre
        }

        return false;
    }

    private function installChildTabs($parentId)
    {
        $tab = new Tab();
        $tab->active = 1;
        $tab->class_name = 'AdminCommercialsales'; // clase que usará el controlador
        $tab->name = [];

        foreach (Language::getLanguages(true) as $lang) {
            $tab->name[$lang['id_lang']] = 'Zona Comercial';
        }

        $tab->id_parent = $parentId;
        $tab->module = $this->name;

        return $tab->add();
    }

    private function uninstallTabs()
    {
        $tabs = ['AdminCommercialsales', 'AdminZonaComerciales'];

        foreach ($tabs as $className) {
            $idTab = (int) Tab::getIdFromClassName($className);
            if ($idTab) {
                $tab = new Tab($idTab);
                $tab->delete();
            }
        }

        return true;
    }
}
