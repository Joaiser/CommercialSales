<?php

class AdminCommercialsalesController extends ModuleAdminController
{
    public function __construct()
    {
        parent::__construct();
        $this->bootstrap = true;
    }

    public function initContent()
    {
        parent::initContent();

        $this->context->smarty->assign([
            'module_dir' => $this->module->getPathUri()
        ]);
        $this->context->controller->addCSS($this->module->getPathUri() . 'views/css/style.css');

        $this->setTemplate('dashboard.tpl');
    }
}
